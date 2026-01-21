import { NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';
import { verifyAdminToken } from '@/lib/auth';

import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Verify admin token from cookie
        const cookieStore = await cookies();
        const token = cookieStore.get('admin-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = verifyAdminToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const metrics = await analyticsService.getDashboardMetrics();
        return NextResponse.json(metrics);

    } catch (error: any) {
        console.error('Dashboard error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
