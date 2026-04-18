import { describe, it, expect } from 'vitest';
import { uploadPdf } from './upload.middleware';

describe('upload.middleware', () => {
  it('exports uploadPdf middleware function', () => {
    expect(uploadPdf).toBeDefined();
    expect(typeof uploadPdf).toBe('function');
  });
});
