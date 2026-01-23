import { NextResponse } from 'next/server';
import { getStripeService } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// CORS headers for CLI access
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
    try {
        // Rate limit: 10 checkout attempts per minute per IP
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const rateLimitResult = await rateLimit(`checkout:${ip}`, 10, 60);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: corsHeaders }
            );
        }

        const { licenseKey, tier, email } = await request.json();

        // Validação
        if (!tier || (tier !== 'free' && tier !== 'pro')) {
            return NextResponse.json(
                { error: 'tier must be "free" or "pro"' },
                { status: 400, headers: corsHeaders }
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

            const session = await getStripeService().createCheckoutSession({
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
        const session = await getStripeService().createWebCheckoutSession({
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
