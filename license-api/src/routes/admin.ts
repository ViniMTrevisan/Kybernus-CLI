import express from 'express';
import analyticsService from '../services/analytics.service.js';

const router = express.Router();

/**
 * GET /admin/dashboard
 * Dashboard com métricas
 */
router.get('/dashboard', async (req, res) => {
    try {
        // TODO: Add authentication here
        // const token = req.headers.authorization?.split(' ')[1];
        // if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const metrics = await analyticsService.getDashboardMetrics();

        res.json(metrics);

    } catch (error: any) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /admin
 * Dashboard HTML
 */
router.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Kybernus Admin Dashboard</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background: #f9fafb; 
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { margin-bottom: 30px; color: #111827; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .card h3 { font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500; }
        .card .value { font-size: 36px; font-weight: bold; color: #111827; }
        .card .sub { font-size: 14px; color: #6b7280; margin-top: 8px; }
        .section { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .section h2 { margin-bottom: 20px; color: #111827; font-size: 18px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .badge.trial { background: #dbeafe; color: #1e40af; }
        .badge.free { background: #d1fae5; color: #065f46; }
        .badge.pro { background: #fef3c7; color: #92400e; }
        .loading { text-align: center; padding: 40px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Kybernus Analytics Dashboard</h1>
        
        <div id="loading" class="loading">Loading metrics...</div>
        
        <div id="content" style="display: none;">
            <div class="grid" id="metrics"></div>
            
            <div class="section">
                <h2>Recent Activity</h2>
                <table id="activity">
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Stack</th>
                            <th>Tier</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>Top Stacks</h2>
                <table id="stacks">
                    <thead>
                        <tr>
                            <th>Stack</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        async function loadDashboard() {
            try {
                const res = await fetch('/admin/dashboard');
                const data = await res.json();
                
                document.getElementById('loading').style.display = 'none';
                document.getElementById('content').style.display = 'block';
                
                // Metrics cards
                const metricsHTML = \`
                    <div class="card">
                        <h3>Total Users</h3>
                        <div class="value">\${data.metrics.total.users}</div>
                    </div>
                    <div class="card">
                        <h3>Trial Users</h3>
                        <div class="value">\${data.metrics.total.trial}</div>
                        <div class="sub">\${data.metrics.conversions.trialToFree}% → FREE</div>
                    </div>
                    <div class="card">
                        <h3>FREE Tier</h3>
                        <div class="value">\${data.metrics.total.free}</div>
                        <div class="sub">$\${data.metrics.revenue.mrr} MRR</div>
                    </div>
                    <div class="card">
                        <h3>PRO Tier</h3>
                        <div class="value">\${data.metrics.total.pro}</div>
                        <div class="sub">$\${data.metrics.revenue.lifetime} lifetime</div>
                    </div>
                \`;
                document.getElementById('metrics').innerHTML = metricsHTML;
                
                // Recent activity
                const activityHTML = data.recentActivity
                    .slice(0, 20)
                    .map(e => \`
                        <tr>
                            <td>\${e.event}</td>
                            <td>\${e.stack || '-'}</td>
                            <td><span class="badge \${e.tier}">\${e.tier}</span></td>
                            <td>\${new Date(e.timestamp).toLocaleString()}</td>
                        </tr>
                    \`)
                    .join('');
                document.querySelector('#activity tbody').innerHTML = activityHTML;
                
                // Top stacks
                const stacksHTML = data.topStacks
                    .map(s => \`
                        <tr>
                            <td>\${s.stack}</td>
                            <td>\${s.count}</td>
                        </tr>
                    \`)
                    .join('');
                document.querySelector('#stacks tbody').innerHTML = stacksHTML;
                
            } catch (error) {
                document.getElementById('loading').innerHTML = '❌ Error loading dashboard';
                console.error(error);
            }
        }
        
        loadDashboard();
        
        // Refresh every 30 seconds
        setInterval(loadDashboard, 30000);
    </script>
</body>
</html>
    `);
});

export default router;
