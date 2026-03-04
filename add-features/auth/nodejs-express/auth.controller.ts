import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {

    async register(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const result = await authService.register(email, password);
            return res.status(201).json(result);
        } catch (error: any) {
            if (error.message === 'User already exists') {
                return res.status(409).json({ error: 'User already exists' });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const result = await authService.login(email, password);
            return res.status(200).json(result);
        } catch (error: any) {
            if (error.message === 'Invalid credentials') {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getProfile(req: Request, res: Response) {
        // req.user is populated by the auth.middleware.ts
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        try {
            const profile = await authService.getUserProfile(user.userId);
            return res.status(200).json(profile);
        } catch (error) {
            return res.status(404).json({ error: 'User not found' });
        }
    }
}
