import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import authRoutes from './controllers/auth.controller';
import paymentsRoutes from './controllers/payments.controller';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Logging
app.use(morgan('dev'));

// Body parsing (raw for Stripe webhooks)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsRoutes);

// Error handling (must be last)
app.use(errorHandler);

export default app;