import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:8000/api';

describe('API Integration Tests', () => {
  let adminToken: string | null = null;
  let testProductId: number | null = null;
  let testCustomerId: number | null = null;

  beforeAll(async () => {
    // Login as admin to get authentication
    try {
      const loginResponse = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
        }),
      });
      
      if (loginResponse.ok) {
        const data = await loginResponse.json();
        adminToken = data.token || 'authenticated';
      }
    } catch (error) {
      console.warn('Could not authenticate for tests:', error);
    }
  });

  describe('Authentication API', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.role).toBe('Admin');
      expect(data.employee).toBeDefined();
      expect(data.employee.username).toBe('admin');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'invalid',
          password: 'wrongpassword',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should reject login with missing credentials', async () => {
      const response = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe('Products API', () => {
    it('should fetch all products', async () => {
      const response = await fetch(`${API_BASE}/products/`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a new product', async () => {
      const newProduct = {
        id: 9999,
        name: 'Test Product',
        price: '99.99',
        is_rental: false,
      };

      const response = await fetch(`${API_BASE}/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.id).toBe(newProduct.id);
      expect(data.name).toBe(newProduct.name);
      testProductId = data.id;
    });

    it('should fetch a specific product', async () => {
      if (!testProductId) {
        testProductId = 1001; // Use sample data product
      }
      const response = await fetch(`${API_BASE}/products/${testProductId}/`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.id).toBe(testProductId);
    });

    it('should update a product', async () => {
      if (!testProductId) {
        testProductId = 1001;
      }
      const updatedProduct = {
        name: 'Updated Test Product',
        price: '149.99',
      };

      const response = await fetch(`${API_BASE}/products/${testProductId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.name).toBe(updatedProduct.name);
    });
  });

  describe('Employees API', () => {
    it('should fetch all employees', async () => {
      const response = await fetch(`${API_BASE}/employees/`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should fetch a specific employee by username', async () => {
      const response = await fetch(`${API_BASE}/employees/admin/`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.username).toBe('admin');
      expect(data.position).toBe('Admin');
    });

    it('should create a new employee', async () => {
      const uniqueUsername = `testuser${Date.now()}`;
      const newEmployee = {
        username: uniqueUsername,
        first_name: 'Test',
        last_name: 'User',
        position: 'Cashier',
        password: 'testpass123',
      };

      const response = await fetch(`${API_BASE}/employees/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Employee creation error:', errorData);
      }

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.username).toBe(newEmployee.username);
      expect(data.first_name).toBe(newEmployee.first_name);
    });
  });

  describe('Customers API', () => {
    it('should fetch all customers', async () => {
      const response = await fetch(`${API_BASE}/customers/`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a new customer', async () => {
      const phoneNumber = `0300${Math.floor(Math.random() * 10000000)}`;
      const newCustomer = {
        phone_number: phoneNumber,
      };

      const response = await fetch(`${API_BASE}/customers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.phone_number).toBe(phoneNumber);
      testCustomerId = data.id;
    });
  });

  describe('Transactions API', () => {
    it('should create a sale transaction', async () => {
      const transaction = {
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

      const response = await fetch(`${API_BASE}/transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.type).toBe('SALE');
      expect(data.total_after_tax).toBe('106.00');
    });

    it('should fetch all transactions', async () => {
      const response = await fetch(`${API_BASE}/transactions/`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Inventory API', () => {
    it('should fetch all inventory items', async () => {
      const response = await fetch(`${API_BASE}/inventory/`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should fetch inventory for a specific product', async () => {
      const productId = 1001;
      const response = await fetch(`${API_BASE}/inventory/`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      if (data.length > 0) {
        // Inventory returns product object, check if any inventory item has the product
        const inventoryItem = data.find((item: any) => item.product?.id === productId);
        if (inventoryItem) {
          expect(inventoryItem.product.id).toBe(productId);
          expect(inventoryItem).toHaveProperty('quantity');
        }
      }
    });
  });

  describe('Coupons API', () => {
    it('should fetch all coupons', async () => {
      const response = await fetch(`${API_BASE}/coupons/`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a new coupon', async () => {
      const newCoupon = {
        code: `TEST${Math.floor(Math.random() * 1000)}`,
        discount_percent: 15,
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
      };

      const response = await fetch(`${API_BASE}/coupons/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.code).toBe(newCoupon.code);
      // discount_percent is returned as a string from DecimalField
      expect(parseFloat(data.discount_percent)).toBe(newCoupon.discount_percent);
    });
  });

  describe('Rentals API', () => {
    it('should fetch all rentals', async () => {
      const response = await fetch(`${API_BASE}/rentals/`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a rental transaction', async () => {
      // First create a transaction
      const transaction = {
        type: 'RENTAL',
        cashier: 'cashier',
        customer: testCustomerId || 1,
        total_before_tax: '50.00',
        tax_amount: '0.00',
        total_after_tax: '50.00',
        items: [
          {
            product_id: 2001, // Rental product
            quantity: 1,
            unit_price: '50.00',
            line_total: '50.00',
          },
        ],
      };

      const transResponse = await fetch(`${API_BASE}/transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });

      if (transResponse.ok) {
        const transData = await transResponse.json();
        
        // Then create rental record
        const rental = {
          customer: testCustomerId || 1,
          product_id: 2001,
          rented_at: new Date().toISOString(),
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_returned: false,
          days_late: 0,
          late_fee: '0.00',
          rent_transaction: transData.id,
        };

        const response = await fetch(`${API_BASE}/rentals/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rental),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.is_returned).toBe(false);
      }
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test product if created
    if (testProductId) {
      try {
        await fetch(`${API_BASE}/products/${testProductId}/`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.warn('Could not cleanup test product:', error);
      }
    }
  });
});

