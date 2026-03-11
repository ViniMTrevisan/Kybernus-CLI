import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../../../infrastructure/config/registry/auth.registry';

// ── Validation schemas ────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// ── Cookie helpers ────────────────────────────────────────────────────────────
const REFRESH_COOKIE = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ── Controllers ───────────────────────────────────────────────────────────────
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const user = await authService.register(parsed.data);

    // Generate tokens right away so the client is logged in after registration
    const loginResult = await authService.login({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    res.cookie(REFRESH_COOKIE, loginResult.refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ user, accessToken: loginResult.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const { accessToken, refreshToken, user } = await authService.login(parsed.data);
    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.status(200).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
  if (!token) {
    res.status(401).json({ error: 'Refresh token não encontrado' });
    return;
  }

  try {
    const { accessToken } = await authService.refreshToken(token);
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];

  try {
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie(REFRESH_COOKIE);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export function me(req: Request, res: Response): void {
  res.status(200).json(req.user);
}

export function adminTest(_req: Request, res: Response): void {
  res.status(200).json({ message: 'Admin access granted' });
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const parsed = z
    .object({ email: z.string().email('Email inválido') })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    await authService.forgotPassword({ email: parsed.data.email });
    // Always respond with the same message to prevent user enumeration
    res
      .status(200)
      .json({ message: 'Se o email existir, você receberá as instruções em breve.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const parsed = z
    .object({
      token: z.string().min(1, 'Token é obrigatório'),
      newPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    await authService.resetPassword(parsed.data);
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    next(err);
  }
}
