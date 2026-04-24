import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import prisma from '../lib/prisma';
import { config } from '../config';
import type { AuthResponse } from '../types';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';
import { generateOTP, sendVerificationEmail } from './email.service';

export async function register(input: RegisterInput): Promise<AuthResponse & { emailVerified: boolean }> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    const error = new Error('Email already exists');
    (error as any).status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const verifyCode = generateOTP();
  const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry,
    },
  });

  // Send verification email (non-blocking — don't fail registration if email fails)
  sendVerificationEmail(input.email, verifyCode);

  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as StringValue }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
    },
    emailVerified: false,
  };
}

export async function verifyEmail(userId: string, code: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const error = new Error('User not found');
    (error as any).status = 404;
    throw error;
  }

  if (user.emailVerified) {
    return; // Already verified
  }

  if (!user.verifyCode || user.verifyCode !== code) {
    const error = new Error('Invalid verification code');
    (error as any).status = 400;
    throw error;
  }

  if (!user.verifyCodeExpiry || user.verifyCodeExpiry < new Date()) {
    const error = new Error('Verification code expired');
    (error as any).status = 400;
    throw error;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true, verifyCode: null, verifyCodeExpiry: null },
  });
}

export async function resendVerification(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const error = new Error('User not found');
    (error as any).status = 404;
    throw error;
  }

  if (user.emailVerified) {
    const error = new Error('Email already verified');
    (error as any).status = 400;
    throw error;
  }

  const verifyCode = generateOTP();
  const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { verifyCode, verifyCodeExpiry },
  });

  await sendVerificationEmail(user.email, verifyCode);
}

export async function updateProfile(userId: string, name: string): Promise<{ id: string; name: string; email: string; createdAt: Date }> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
  });
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    (error as any).status = 404;
    throw error;
  }

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) {
    const error = new Error('Current password is incorrect');
    (error as any).status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    const error = new Error('Invalid credentials');
    (error as any).status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(input.password, user.password);

  if (!valid) {
    const error = new Error('Invalid credentials');
    (error as any).status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as StringValue }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
    },
  };
}


export async function forgotPassword(email: string): Promise<{ message: string; resetToken: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('No account found with that email');
    (error as any).status = 404;
    throw error;
  }

  const resetToken = crypto.randomUUID();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  return {
    message: 'Password reset token generated. In production, this would be emailed to you.',
    resetToken,
  };
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { resetToken: token },
  });

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    (error as any).status = 400;
    throw error;
  }

  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    const error = new Error('Reset token has expired');
    (error as any).status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
  });
}

export async function deleteAccount(userId: string, password: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    (error as any).status = 404;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error = new Error('Password is incorrect');
    (error as any).status = 400;
    throw error;
  }

  // Delete all user's interview questions, then interviews, then user
  await prisma.interviewQuestion.deleteMany({
    where: { interview: { userId } },
  });
  await prisma.interview.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}
