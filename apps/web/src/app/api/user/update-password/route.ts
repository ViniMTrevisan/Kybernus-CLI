import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
    try {
        const { email, currentPassword, newPassword } = await request.json();

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

        // 2. Validate User & Password
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid current password' }, { status: 401 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // 3. Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
