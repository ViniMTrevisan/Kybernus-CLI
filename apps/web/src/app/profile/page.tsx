import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyUserToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import ProfileClient from './ProfileClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profile Config | Kybernus',
    description: 'Manage your Kybernus account settings.',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('user-token')?.value;

    if (!token) {
        redirect('/login');
    }

    const payload = verifyUserToken(token);
    if (!payload) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: payload.email },
        select: {
            email: true,
        },
    });

    if (!user) {
        redirect('/login');
    }

    return <ProfileClient user={user} />;
}
