import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    console.log('[AdminLayout] Checking access. Token present:', !!token);

    if (!token) {
        redirect('/admin-login');
    }

    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== 'admin') {
        redirect('/admin-login');
    }

    return (
        <>
            {children}
        </>
    );
}
