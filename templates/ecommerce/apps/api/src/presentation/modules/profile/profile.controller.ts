import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { profileService } from '../../../infrastructure/config/registry/profile.registry';
import { tokenService } from '../../../infrastructure/config/registry/auth.registry';

const REFRESH_COOKIE = 'refreshToken';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await profileService.getProfile(req.user!.id);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = z
    .object({
      name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
      email: z.string().email('Email inválido').optional(),
    })
    .refine((d) => d.name !== undefined || d.email !== undefined, {
      message: 'Ao menos um campo (name ou email) deve ser informado',
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors, message: parsed.error.errors[0]?.message });
    return;
  }

  try {
    const profile = await profileService.updateProfile(req.user!.id, parsed.data);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = z
    .object({
      currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
      newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    await profileService.changePassword(req.user!.id, parsed.data);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = z
    .object({
      password: z.string().min(1, 'Senha é obrigatória para confirmar exclusão'),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    await profileService.deleteAccount(req.user!.id, parsed.data.password);

    // Best-effort: invalidate the refresh token cookie if present
    const refreshToken = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
    if (refreshToken) {
      try {
        await tokenService.invalidateRefreshToken(refreshToken);
      } catch {
        // ignore — token may already be expired
      }
    }

    res.clearCookie(REFRESH_COOKIE);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
