import type { Request, Response, NextFunction } from 'express';
import { registerInputSchema, loginInputSchema, updateProfileSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema, deleteAccountSchema } from '../validators/auth.validator';
import * as authService from '../services/auth.service';

function formatZodErrors(error: any) {
  return {
    status: 400,
    message: 'Validation failed',
    errors: error.issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(formatZodErrors(parsed.error));
      return;
    }

    const result = await authService.register(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(formatZodErrors(parsed.error));
      return;
    }

    const result = await authService.login(parsed.data);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}


export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(formatZodErrors(parsed.error));
      return;
    }

    const user = await authService.updateProfile(req.user!.id, parsed.data.name);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(formatZodErrors(parsed.error));
      return;
    }

    await authService.changePassword(req.user!.id, parsed.data.oldPassword, parsed.data.newPassword);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}


export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(formatZodErrors(parsed.error));
      return;
    }

    const result = await authService.forgotPassword(parsed.data.email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(formatZodErrors(parsed.error));
      return;
    }

    await authService.resetPassword(parsed.data.token, parsed.data.newPassword);
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = deleteAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(formatZodErrors(parsed.error));
      return;
    }

    await authService.deleteAccount(req.user!.id, parsed.data.password);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
}


export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== 'string') {
      res.status(400).json({ status: 400, message: 'Google ID token is required' });
      return;
    }

    const { googleAuth } = await import('../services/google-auth.service');
    const result = await googleAuth(idToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
