import prisma from '../database/client.js';
import crypto from 'crypto';
import { LicenseTier, LicenseStatus } from '@prisma/client';

export class LicenseService {
    /**
     * Gera uma license key única
     */
    generateLicenseKey(tier: string): string {
        const random = crypto.randomBytes(16).toString('hex');
        const prefix = tier === 'pro' ? 'PRO' : tier === 'trial' ? 'TRIAL' : 'FREE';

        // Formato: KYB-{PREFIX}-XXXX-XXXX-XXXX
        return `KYB-${prefix}-${random.slice(0, 4)}-${random.slice(4, 8)}-${random.slice(8, 12)}`.toUpperCase();
    }

    /**
     * Cria um novo usuário em trial
     */
    async createTrialUser(email: string) {
        const licenseKey = this.generateLicenseKey('trial');
        // Trial praticamente eterno (100 anos), limitado por uso
        const trialEndsAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);

        return await prisma.user.create({
            data: {
                email,
                licenseKey,
                tier: 'FREE',
                status: 'TRIAL',
                trialStartedAt: new Date(),
                trialEndsAt,
                // projectUsage defaults to 0, limit to 3 via schema
            },
        });
    }

    /**
     * Valida uma license key
     */
    async validate(licenseKey: string) {
        const user = await prisma.user.findUnique({
            where: { licenseKey },
            include: { subscription: true },
        });

        if (!user) {
            return {
                valid: false,
                message: 'License key not found',
            };
        }

        // Atualiza lastValidatedAt
        await prisma.user.update({
            where: { id: user.id },
            data: { lastValidatedAt: new Date() },
        });

        // Verifica status do trial
        if (user.status === 'TRIAL') {
            // Removida verificação de tempo - Modelo Metered (3 projetos)

            return {
                valid: true,
                status: 'TRIAL',
                tier: 'pro',
                trialEndsAt: user.trialEndsAt,
                usage: user.projectUsage,
                limit: user.projectLimit,
                message: `Trial Active: ${user.projectUsage}/${user.projectLimit} projects used`,
            };
        }

        // Verifica outros status
        if (user.status === 'TRIAL_EXPIRED') {
            return {
                valid: false,
                status: 'TRIAL_EXPIRED',
                message: 'Trial has expired. Please upgrade.',
            };
        }

        if (user.status === 'CANCELLED') {
            return {
                valid: false,
                status: 'CANCELLED',
                message: 'License has been cancelled',
            };
        }

        if (user.status === 'FREE_PAST_DUE') {
            return {
                valid: false,
                status: 'FREE_PAST_DUE',
                message: 'Payment failed. Please update payment method.',
            };
        }

        // FREE_ACTIVE ou PRO_ACTIVE
        return {
            valid: true,
            status: user.status,
            tier: user.tier.toLowerCase(),
            email: user.email,
            message: 'License is active',
        };
    }

    /**
     * Ativa upgrade (chamado após Stripe checkout success)
     */
    async activateUpgrade(params: {
        licenseKey: string;
        tier: 'FREE' | 'PRO';
        stripeCustomerId: string;
        stripeSubscriptionId?: string;
    }) {
        const newLicenseKey = this.generateLicenseKey(params.tier.toLowerCase());
        const status = params.tier === 'PRO' ? 'PRO_ACTIVE' : 'FREE_ACTIVE';

        return await prisma.user.update({
            where: { licenseKey: params.licenseKey },
            data: {
                licenseKey: newLicenseKey,
                tier: params.tier,
                status,
                stripeCustomerId: params.stripeCustomerId,
            },
        });
    }

    /**
     * Cancela subscription FREE
     */
    async cancelSubscription(licenseKey: string) {
        return await prisma.user.update({
            where: { licenseKey },
            data: { status: 'CANCELLED' },
        });
    }

    /**
     * Busca usuário por email
     */
    async findByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Busca usuário por Stripe customer ID
     */
    async findByStripeCustomerId(customerId: string) {
        return await prisma.user.findUnique({
            where: { stripeCustomerId: customerId },
        });
    }

    /**
     * Consome 1 crédito de criação de projeto
     */
    async consumeProjectCredit(licenseKey: string) {
        const user = await prisma.user.findUnique({ where: { licenseKey } });

        if (!user) {
            return { authorized: false, message: 'License not found' };
        }

        // Se for pago (Monthly ou Lifetime), ilimitado
        const isPaid = user.status === 'PRO_ACTIVE' || user.status === 'FREE_ACTIVE';

        if (isPaid) {
            await prisma.user.update({
                where: { id: user.id },
                data: { projectUsage: { increment: 1 } }
            });
            return { authorized: true, usage: user.projectUsage + 1, limit: -1 };
        }

        // Se for TRIAL
        if (user.status === 'TRIAL') {
            if (user.projectUsage >= user.projectLimit) {
                return {
                    authorized: false,
                    message: `Trial limit reached (${user.projectLimit}/${user.projectLimit} projects created). Please upgrade to continue.`,
                    usage: user.projectUsage,
                    limit: user.projectLimit
                };
            }

            const updated = await prisma.user.update({
                where: { id: user.id },
                data: { projectUsage: { increment: 1 } }
            });

            return {
                authorized: true,
                usage: updated.projectUsage,
                limit: updated.projectLimit,
                remaining: updated.projectLimit - updated.projectUsage
            };
        }

        return { authorized: false, message: 'License inactive or expired' };
    }
}
