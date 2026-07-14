import { describe, expect, it } from 'vitest';
import { respond } from '../src/utils/api.js';

describe('API Utils', () => {
  describe('respond', () => {
    it('formats a standard API response', () => {
      const mockRes = {
        status: (code: number) => mockRes,
        json: (data: any) => data,
      } as any;

      const result = respond(mockRes, 200, 'Success', { id: 1 });
      expect(result).toEqual({
        success: true,
        message: 'Success',
        data: { id: 1 },
      });
    });

    it('formats an error response without data', () => {
      const mockRes = {
        status: (code: number) => mockRes,
        json: (data: any) => data,
      } as any;

      const result = respond(mockRes, 404, 'Not found');
      expect(result).toEqual({
        success: false,
        message: 'Not found',
        data: undefined,
      });
    });
  });
});
