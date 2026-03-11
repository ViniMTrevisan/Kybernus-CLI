import { Router } from 'express';
import express from 'express';
import { authenticate } from '../../shared/middlewares/authenticate';
import * as checkoutController from './checkout.controller';

const router = Router();

// POST /api/checkout — create order and payment intent
router.post('/', authenticate, checkoutController.checkout);

// POST /api/checkout/webhook — Stripe webhook (raw body required for signature verification)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  checkoutController.webhook,
);

export default router;
