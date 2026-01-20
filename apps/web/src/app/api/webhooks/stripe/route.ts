import { NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe';
import { licenseService } from '@/services/license.service';
import { emailService } from '@/lib/email';
import { invalidateLicenseCache } from '@/lib/redis';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
        return NextResponse.json(
            { error: 'Missing stripe-signature header' },
            { status: 400 }
        );
    }

    try {
        // Read raw body
        const rawBody = await request.text();

        const event = stripeService.constructEvent(rawBody, sig);

        console.log(`[Webhook] Received: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const metadata = session.metadata || {};

                // Cenário 1: Upgrade via CLI (tem licenseKey no metadata)
                if (metadata.licenseKey) {
                    console.log('[Webhook] Upgrading existing user:', metadata.licenseKey);
                    const user = await licenseService.activateUpgrade({
                        licenseKey: metadata.licenseKey,
                        tier: 'PRO',
                        stripeCustomerId: session.customer,
                        stripeSubscriptionId: session.subscription || undefined,
                    });
                    console.log('[Webhook] User upgraded:', user.email);

                    // Send upgrade confirmation email
                    await emailService.sendUpgradeConfirmation(user.email, user.licenseKey);

                    // Invalidate license cache
                    await invalidateLicenseCache(user.licenseKey);
                }
                // Cenário 2: Compra via Site (sem licenseKey, criar novo usuário)
                else {
                    const email = session.customer_details?.email || session.customer_email;
                    console.log('[Webhook] New customer via Website:', email);

                    if (email) {
                        // Verifica se user já existe
                        let user = await licenseService.findByEmail(email);

                        if (!user) {
                            // Cria novo usuário Pro direto
                            user = await prisma.user.create({
                                data: {
                                    email,
                                    licenseKey: `KYB-PRO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                                    tier: 'PRO',
                                    status: 'PRO_ACTIVE',
                                    stripeCustomerId: session.customer,
                                }
                            });

                            // Send license key email - CRITICAL for UX
                            await emailService.sendLicenseKey(user.email, user.licenseKey);
                            console.log('[Webhook] Created new PRO user and sent license email:', user.licenseKey);
                        } else {
                            // Usuário existe mas comprou por fora
                            await licenseService.activateUpgrade({
                                licenseKey: user.licenseKey,
                                tier: 'PRO',
                                stripeCustomerId: session.customer,
                            });
                            console.log('[Webhook] Upgraded existing user found by email:', user.email);
                        }
                    }
                }

                // Se é subscription, criar registro
                if (session.subscription) {
                    const email = session.customer_details?.email || session.customer_email || session.metadata?.email;
                    if (email) {
                        const user = await licenseService.findByEmail(email);
                        if (user) {
                            await prisma.subscription.create({
                                data: {
                                    userId: user.id,
                                    stripeSubscriptionId: session.subscription,
                                    stripePriceId: session.line_items?.data[0]?.price?.id || '',
                                    stripeStatus: 'active',
                                    currentPeriodStart: new Date(),
                                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                                },
                            });
                        }
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;

                const user = await licenseService.findByStripeCustomerId(subscription.customer);
                if (user) {
                    await licenseService.cancelSubscription(user.licenseKey);
                    console.log('[Webhook] Subscription cancelled:', user.email);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;

                const user = await licenseService.findByStripeCustomerId(invoice.customer);
                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { status: 'FREE_PAST_DUE' },
                    });
                    console.log('[Webhook] Payment failed:', user.email);
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;

                if (invoice.billing_reason === 'subscription_cycle') {
                    const sub = await prisma.subscription.findUnique({
                        where: { stripeSubscriptionId: invoice.subscription },
                    });

                    if (sub) {
                        await prisma.subscription.update({
                            where: { id: sub.id },
                            data: {
                                currentPeriodStart: new Date(invoice.period_start * 1000),
                                currentPeriodEnd: new Date(invoice.period_end * 1000),
                            },
                        });

                        // Reative se estava past_due
                        await prisma.user.update({
                            where: { id: sub.userId },
                            data: { status: 'FREE_ACTIVE' },
                        });
                    }
                }
                break;
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('[Webhook] Error:', error.message);
        return NextResponse.json(
            { error: `Webhook Error: ${error.message}` },
            { status: 400 }
        );
    }
}
