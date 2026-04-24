import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { StringValue } from 'ms';
import prisma from '../lib/prisma';
import { config } from '../config';
import type { AuthResponse } from '../types';

interface GoogleTokenPayload {
  email: string;
  name: string;
  sub: string;
  email_verified: boolean;
}

async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload> {
  // Verify the Google ID token by calling Google's tokeninfo endpoint
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

  if (!response.ok) {
    const error = new Error('Invalid Google token');
    (error as any).status = 401;
    throw error;
  }

  const payload = await response.json();

  // Verify the audience matches our client ID (if configured)
  if (config.googleClientId && payload.aud !== config.googleClientId) {
    const error = new Error('Google token audience mismatch');
    (error as any).status = 401;
    throw error;
  }

  if (!payload.email_verified) {
    const error = new Error('Google email not verified');
    (error as any).status = 401;
    throw error;
  }

  return {
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    sub: payload.sub,
    email_verified: payload.email_verified === 'true' || payload.email_verified === true,
  };
}

export async function googleAuth(idToken: string): Promise<AuthResponse> {
  const googleUser = await verifyGoogleToken(idToken);

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email: googleUser.email },
  });

  if (!user) {
    // Create new user with a random password (they'll use Google to login)
    const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);

    user = await prisma.user.create({
      data: {
        name: googleUser.name,
        email: googleUser.email,
        password: randomPassword,
      },
    });
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
