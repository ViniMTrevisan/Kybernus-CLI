import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import licensesRouter from './routes/licenses.js';
import analyticsRouter from './routes/analytics.js';
import webhooksRouter from './routes/webhooks.js';
import checkoutRouter from './routes/checkout.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));

// Middlewares
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
}));

// Stripe webhooks need raw body
app.use('/webhooks', webhooksRouter);

// JSON for all other routes
app.use(express.json());

// Routes
app.use('/api/auth', licensesRouter);
app.use('/api/licenses', licensesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/checkout', checkoutRouter);
app.use('/admin', adminRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Kybernus License API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
