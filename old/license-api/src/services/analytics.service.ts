import prisma from '../database/client.js';

export class AnalyticsService {
    /**
     * Rastreia um evento
     */
    async track(params: {
        licenseKey?: string;
        event: string;
        tier?: string;
        stack?: string;
        architecture?: string;
        command?: string;
        metadata?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        let userId: string | undefined;

        if (params.licenseKey) {
            const user = await prisma.user.findUnique({
                where: { licenseKey: params.licenseKey },
                select: { id: true },
            });
            userId = user?.id;
        }

        return await prisma.analyticsEvent.create({
            data: {
                userId,
                event: params.event,
                tier: params.tier,
                stack: params.stack,
                architecture: params.architecture,
                command: params.command,
                metadata: params.metadata,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            },
        });
    }

    /**
     * Dashboard metrics
     */
    async getDashboardMetrics() {
        const [
            totalUsers,
            trialUsers,
            freeUsers,
            proUsers,
            recentEvents,
            topStacks,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'TRIAL' } }),
            prisma.user.count({ where: { status: 'FREE_ACTIVE' } }),
            prisma.user.count({ where: { status: 'PRO_ACTIVE' } }),
            prisma.analyticsEvent.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true, tier: true } } },
            }),
            prisma.analyticsEvent.groupBy({
                by: ['stack'],
                where: { stack: { not: null } },
                _count: { stack: true },
                orderBy: { _count: { stack: 'desc' } },
                take: 10,
            }),
        ]);

        // Calculate revenue
        const mrr = freeUsers * 7; // $7/month
        const lifetime = proUsers * 97; // $97 one-time
        const total = lifetime + mrr * 12; // Approximate ARR

        return {
            metrics: {
                total: {
                    users: totalUsers,
                    trial: trialUsers,
                    free: freeUsers,
                    pro: proUsers,
                },
                revenue: {
                    total,
                    mrr,
                    lifetime,
                },
                conversions: {
                    trialToFree: freeUsers > 0 ? ((freeUsers / totalUsers) * 100).toFixed(1) : '0',
                    trialToPro: proUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : '0',
                },
            },
            recentActivity: recentEvents.map(e => ({
                event: e.event,
                stack: e.stack,
                tier: e.user?.tier || e.tier,
                timestamp: e.createdAt,
            })),
            topStacks: topStacks.map(s => ({
                stack: s.stack,
                count: s._count.stack,
            })),
        };
    }
}

export default new AnalyticsService();
