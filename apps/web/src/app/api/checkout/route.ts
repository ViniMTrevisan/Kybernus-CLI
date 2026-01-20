import { NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { licenseKey, tier, email } = await request.json();

        // Validação
        if (!tier || (tier !== 'free' && tier !== 'pro')) {
            return NextResponse.json(
                { error: 'tier must be "free" or "pro"' },
                { status: 400 }
            );
        }

        // Se tem licenseKey, é upgrade via CLI
        if (licenseKey) {
            const user = await prisma.user.findUnique({
                where: { licenseKey },
            });

            if (!user) {
                return NextResponse.json(
                    { error: 'License not found' },
                    { status: 404 }
                );
            }

            const session = await stripeService.createCheckoutSession({
                licenseKey,
                tier,
                email: user.email,
                userId: user.id,
            });

            return NextResponse.json({
                checkoutUrl: session.url,
                sessionId: session.id,
            });
        }

        // Caso contrário, é compra via website (novo cliente)
        const session = await stripeService.createWebCheckoutSession({
            tier,
            email,
        });

        return NextResponse.json({
            checkoutUrl: session.url,
            sessionId: session.id,
        });

    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
