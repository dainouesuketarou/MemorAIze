import { Email } from '../../../domain/value-object/email';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');

      expect(email.value).toBe('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = Email.create('TEST@EXAMPLE.COM');

      expect(email.value).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  test@example.com  ');

      expect(email.value).toBe('test@example.com');
    });

    it('should throw error for invalid email format', () => {
      expect(() => {
        Email.create('invalid-email');
      }).toThrow('Invalid email format.');

      expect(() => {
        Email.create('test@');
      }).toThrow('Invalid email format.');

      expect(() => {
        Email.create('@example.com');
      }).toThrow('Invalid email format.');

      expect(() => {
        Email.create('test.example.com');
      }).toThrow('Invalid email format.');
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@example-domain.org',
        'user@sub.example.com',
      ];

      validEmails.forEach((emailStr) => {
        expect(() => {
          Email.create(emailStr);
        }).not.toThrow();
      });
    });
  });

  describe('fromString', () => {
    it('should create email without validation', () => {
      const email = Email.fromString('test@example.com');

      expect(email.value).toBe('test@example.com');
    });

    it('should create email even with invalid format', () => {
      const email = Email.fromString('invalid-email');

      expect(email.value).toBe('invalid-email');
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('TEST@EXAMPLE.COM');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('other@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email as string', () => {
      const email = Email.create('test@example.com');

      expect(email.toString()).toBe('test@example.com');
    });
  });
});
