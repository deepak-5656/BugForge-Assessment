import { describe, expect, it } from 'vitest';
import { projectSchema, taskSchema, loginSchema, registerSchema, commentSchema } from '../src/validators/schemas.js';

describe('Validation Schemas', () => {
  describe('Project Schema', () => {
    it('accepts a valid project key', () => {
      expect(projectSchema.parse({ name: 'Web app', key: 'WEB' }).key).toBe('WEB');
    });

    it('rejects a project key starting with a number', () => {
      expect(() => projectSchema.parse({ name: 'App', key: '1WEB' })).toThrow();
    });
  });

  describe('Task Schema', () => {
    it('rejects unsupported task states', () => {
      expect(() => taskSchema.parse({ title: 'Ship it', status: 'blocked' })).toThrow();
    });

    it('requires a title', () => {
      expect(() => taskSchema.parse({ status: 'todo' })).toThrow();
    });
  });

  describe('Auth Schemas', () => {
    it('requires valid email for login', () => {
      expect(() => loginSchema.parse({ email: 'not-an-email', password: 'pass' })).toThrow();
    });

    it('requires minimum password length for registration', () => {
      expect(() => registerSchema.parse({ name: 'User', email: 'a@b.com', password: '123' })).toThrow();
    });
  });
});
