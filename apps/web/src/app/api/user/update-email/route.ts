import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
    try {
        const { email, newEmail } = await request.json();

        // 1. Verify Authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('user-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyUserToken(token);
        if (!payload || payload.email !== email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Validate Input
        if (!newEmail || !newEmail.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // 3. Check if new email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: newEmail },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }

        // 4. Update Email
        await prisma.user.update({
            where: { email },
            data: { email: newEmail },
        });

        // 5. Clear session (force re-login for security)
        const response = NextResponse.json({ success: true });
        response.cookies.delete('user-token');

        return response;

    } catch (error) {
        console.error('Update email error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
