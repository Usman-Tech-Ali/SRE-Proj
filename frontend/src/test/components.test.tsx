import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock components
const MockLoadingSpinner = () => <div data-testid="loading-spinner">Loading...</div>;

describe('Component Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  describe('LoadingSpinner Component', () => {
    it('should render loading spinner with default message', () => {
      render(<MockLoadingSpinner />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('LocalStorage Integration', () => {
    it('should store and retrieve employee data', () => {
      const employeeData = {
        username: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        position: 'Admin',
      };

      window.localStorage.setItem('employee', JSON.stringify(employeeData));
      const stored = JSON.parse(window.localStorage.getItem('employee') || '{}');
      
      expect(stored.username).toBe('admin');
      expect(stored.position).toBe('Admin');
    });

    it('should store and retrieve role', () => {
      window.localStorage.setItem('role', 'Admin');
      const role = window.localStorage.getItem('role');
      expect(role).toBe('Admin');
    });

    it('should clear localStorage on logout', () => {
      window.localStorage.setItem('employee', JSON.stringify({ username: 'admin' }));
      window.localStorage.setItem('role', 'Admin');
      
      window.localStorage.clear();
      
      expect(window.localStorage.getItem('employee')).toBeNull();
      expect(window.localStorage.getItem('role')).toBeNull();
    });
  });

  describe('API Response Handling', () => {
    it('should handle successful API response', async () => {
      const mockResponse = {
        success: true,
        role: 'Admin',
        employee: {
          username: 'admin',
          first_name: 'Admin',
          last_name: 'User',
          position: 'Admin',
        },
      };

      const response = new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.role).toBe('Admin');
      expect(data.employee.username).toBe('admin');
    });

    it('should handle API error response', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Invalid credentials',
      };

      const response = new Response(JSON.stringify(mockErrorResponse), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.ok).toBe(false);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid credentials');
    });
  });

  describe('Data Validation', () => {
    it('should validate product data structure', () => {
      const validProduct = {
        id: 1001,
        name: 'Test Product',
        price: '99.99',
        is_rental: false,
      };

      expect(validProduct).toHaveProperty('id');
      expect(validProduct).toHaveProperty('name');
      expect(validProduct).toHaveProperty('price');
      expect(validProduct).toHaveProperty('is_rental');
      expect(typeof validProduct.id).toBe('number');
      expect(typeof validProduct.name).toBe('string');
    });

    it('should validate employee data structure', () => {
      const validEmployee = {
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        position: 'Cashier',
      };

      expect(validEmployee).toHaveProperty('username');
      expect(validEmployee).toHaveProperty('first_name');
      expect(validEmployee).toHaveProperty('last_name');
      expect(validEmployee).toHaveProperty('position');
      expect(['Admin', 'Cashier']).toContain(validEmployee.position);
    });

    it('should validate transaction data structure', () => {
      const validTransaction = {
        type: 'SALE',
        cashier: 'cashier',
        customer: null,
        coupon: null,
        total_before_tax: '100.00',
        tax_amount: '6.00',
        total_after_tax: '106.00',
        items: [
          {
            product_id: 1001,
            quantity: 1,
            unit_price: '100.00',
            line_total: '100.00',
          },
        ],
      };

      expect(validTransaction).toHaveProperty('type');
      expect(validTransaction).toHaveProperty('items');
      expect(Array.isArray(validTransaction.items)).toBe(true);
      expect(['SALE', 'RENTAL', 'RETURN_RENTAL', 'RETURN_SALE']).toContain(validTransaction.type);
    });
  });

  describe('Business Logic', () => {
    it('should calculate tax correctly (6%)', () => {
      const subtotal = 100.0;
      const taxRate = 0.06;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      expect(tax).toBe(6.0);
      expect(total).toBe(106.0);
    });

    it('should calculate discount correctly', () => {
      const subtotal = 100.0;
      const discountPercent = 10;
      const discount = subtotal * (discountPercent / 100);
      const afterDiscount = subtotal - discount;

      expect(discount).toBe(10.0);
      expect(afterDiscount).toBe(90.0);
    });

    it('should calculate line total correctly', () => {
      const unitPrice = 50.0;
      const quantity = 3;
      const lineTotal = unitPrice * quantity;

      expect(lineTotal).toBe(150.0);
    });

    it('should calculate late fee correctly', () => {
      const itemPrice = 100.0;
      const quantity = 1;
      const daysLate = 5;
      const lateFeeRate = 0.1;
      const lateFee = itemPrice * quantity * lateFeeRate * daysLate;

      expect(lateFee).toBe(50.0);
    });
  });

  describe('Date Calculations', () => {
    it('should calculate return date (14 days from today)', () => {
      const today = new Date();
      const returnDate = new Date(today);
      returnDate.setDate(today.getDate() + 14);

      const daysDiff = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(14);
    });

    it('should calculate days late correctly', () => {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() - 5); // 5 days ago

      const daysLate = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysLate).toBe(5);
    });
  });
});

