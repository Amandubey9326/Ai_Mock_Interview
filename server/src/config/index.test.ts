import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('dotenv', () => ({
  default: { config: vi.fn() },
}));

describe('config loader', () => {
  const originalEnv = process.env;
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  const validEnv: Record<string, string> = {
    DATABASE_URL: 'postgresql://localhost:5432/test',
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '7d',
    OPENAI_API_KEY: 'sk-test-key',
    PORT: '3000',
  };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('exports a typed config object when all required vars are present', async () => {
    Object.assign(process.env, validEnv);
    const { config } = await import('./index');

    expect(config.databaseUrl).toBe('postgresql://localhost:5432/test');
    expect(config.jwtSecret).toBe('test-secret');
    expect(config.jwtExpiresIn).toBe('7d');
    expect(config.openaiApiKey).toBe('sk-test-key');
    expect(config.port).toBe(3000);
  });

  it('defaults PORT to 5000 when not set', async () => {
    const { PORT: _, ...envWithoutPort } = validEnv;
    Object.assign(process.env, envWithoutPort);
    delete process.env.PORT;

    const { config } = await import('./index');
    expect(config.port).toBe(5000);
  });

  it('calls process.exit(1) when DATABASE_URL is missing', async () => {
    const { DATABASE_URL: _, ...partial } = validEnv;
    Object.assign(process.env, partial);
    delete process.env.DATABASE_URL;

    await expect(() => import('./index')).rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('DATABASE_URL')
    );
  });

  it('calls process.exit(1) when JWT_SECRET is missing', async () => {
    const { JWT_SECRET: _, ...partial } = validEnv;
    Object.assign(process.env, partial);
    delete process.env.JWT_SECRET;

    await expect(() => import('./index')).rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('JWT_SECRET')
    );
  });

  it('calls process.exit(1) when multiple vars are missing', async () => {
    await expect(() => import('./index')).rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('DATABASE_URL')
    );
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('OPENAI_API_KEY')
    );
  });

  it('logs all missing variable names in the error message', async () => {
    await expect(() => import('./index')).rejects.toThrow('process.exit called');
    const errorMessage = errorSpy.mock.calls[0][0] as string;
    expect(errorMessage).toContain('DATABASE_URL');
    expect(errorMessage).toContain('JWT_SECRET');
    expect(errorMessage).toContain('JWT_EXPIRES_IN');
    expect(errorMessage).toContain('OPENAI_API_KEY');
  });
});
