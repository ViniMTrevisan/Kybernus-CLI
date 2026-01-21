import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const response = NextResponse.json({
        success: true,
        message: 'Logged out successfully'
    });

    // Clear the user token cookie
    response.cookies.delete('user-token');

    return response;
}
