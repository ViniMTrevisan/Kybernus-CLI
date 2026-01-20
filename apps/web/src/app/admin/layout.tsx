import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    if (!token) {
        redirect('/admin-login-nao-acharao');
    }

    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== 'admin') {
        redirect('/admin-login-nao-acharao');
    }

    return (
        <>
            {children}
        </>
    );
}
