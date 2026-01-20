import { describe, it, expect, beforeAll } from 'vitest';

const API_URL = 'http://localhost:3010/api';

describe('Trial Limit Enforcement E2E', () => {
    let testUserKey: string;
    let testEmail: string;

    beforeAll(async () => {
        // Create fresh test user with unique email
        testEmail = `e2e-trial-${Date.now()}@test.com`;

        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail })
        });

        const data = await res.json();
        expect(res.status).toBe(201);
        expect(data.licenseKey).toBeDefined();
        testUserKey = data.licenseKey;

        console.log(`[E2E] Created test user: ${testEmail}`);
        console.log(`[E2E] License key: ${testUserKey}`);
    });

    it('should validate the new trial license', async () => {
        const res = await fetch(`${API_URL}/licenses/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey: testUserKey })
        });

        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.valid).toBe(true);
        expect(data.status).toBe('TRIAL');
        expect(data.usage).toBe(0);
        expect(data.limit).toBe(3);
    });

    it('should allow project 1 (usage: 0 -> 1)', async () => {
        const res = await fetch(`${API_URL}/licenses/consume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey: testUserKey })
        });

        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.authorized).toBe(true);
        expect(data.usage).toBe(1);
        expect(data.limit).toBe(3);
        expect(data.remaining).toBe(2);
    });

    it('should allow project 2 (usage: 1 -> 2)', async () => {
        const res = await fetch(`${API_URL}/licenses/consume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey: testUserKey })
        });

        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.authorized).toBe(true);
        expect(data.usage).toBe(2);
        expect(data.remaining).toBe(1);
    });

    it('should allow project 3 (usage: 2 -> 3)', async () => {
        const res = await fetch(`${API_URL}/licenses/consume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey: testUserKey })
        });

        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.authorized).toBe(true);
        expect(data.usage).toBe(3);
        expect(data.remaining).toBe(0);
    });

    it('should BLOCK project 4 (limit reached)', async () => {
        const res = await fetch(`${API_URL}/licenses/consume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey: testUserKey })
        });

        const data = await res.json();
        expect(res.status).toBe(403);
        expect(data.authorized).toBe(false);
        expect(data.message).toContain('limit reached');
        expect(data.usage).toBe(3);
        expect(data.limit).toBe(3);
    });

    it('should still return valid=true but with limit info on validation', async () => {
        const res = await fetch(`${API_URL}/licenses/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey: testUserKey })
        });

        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.valid).toBe(true);
        expect(data.usage).toBe(3);
        expect(data.limit).toBe(3);
    });
});

describe('License Validation E2E', () => {
    it('should return invalid for non-existent license key', async () => {
        const res = await fetch(`${API_URL}/licenses/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey: 'KYB-FAKE-XXXX-XXXX-XXXX' })
        });

        const data = await res.json();
        expect(res.status).toBe(401);
        expect(data.valid).toBe(false);
        expect(data.message).toContain('not found');
    });

    it('should return error for missing license key', async () => {
        const res = await fetch(`${API_URL}/licenses/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data.error).toContain('required');
    });
});

describe('User Registration E2E', () => {
    it('should register new user and return license key', async () => {
        const email = `e2e-reg-${Date.now()}@test.com`;

        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        expect(res.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.licenseKey).toMatch(/^KYB-TRIAL-/);
        expect(data.tier).toBe('free');
        expect(data.status).toBe('TRIAL');
    });

    it('should return existing key if email already registered', async () => {
        const email = `e2e-dup-${Date.now()}@test.com`;

        // First registration
        const res1 = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data1 = await res1.json();
        expect(res1.status).toBe(201);

        // Second registration (should fail with existing key)
        const res2 = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data2 = await res2.json();
        expect(res2.status).toBe(400);
        expect(data2.error).toContain('already registered');
        expect(data2.licenseKey).toBe(data1.licenseKey);
    });

    it('should reject invalid email', async () => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'not-an-email' })
        });

        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data.error).toContain('Valid email');
    });
});

describe('Analytics Tracking E2E', () => {
    it('should track events successfully', async () => {
        const res = await fetch(`${API_URL}/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'e2e_test_event',
                stack: 'nodejs-express',
                architecture: 'mvc',
                command: 'init'
            })
        });

        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
    });

    it('should require event name', async () => {
        const res = await fetch(`${API_URL}/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data.error).toContain('required');
    });
});

describe('Checkout API E2E', () => {
    it('should create checkout session for PRO tier', async () => {
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tier: 'pro' })
        });

        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.checkoutUrl).toContain('checkout.stripe.com');
        expect(data.sessionId).toBeDefined();
    });

    it('should reject invalid tier', async () => {
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tier: 'invalid' })
        });

        const data = await res.json();
        expect(res.status).toBe(400);
    });
});
