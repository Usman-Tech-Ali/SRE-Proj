import { describe, it, expect, beforeEach } from 'vitest';

const API_BASE = 'http://localhost:8000/api';

describe('User Flow Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('Admin User Flow', () => {
    it('should complete admin login flow', async () => {
      // Step 1: Login
      const loginResponse = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
        }),
      });

      expect(loginResponse.ok).toBe(true);
      const loginData = await loginResponse.json();
      expect(loginData.success).toBe(true);
      expect(loginData.role).toBe('Admin');

      // Step 2: Store in localStorage (simulating frontend behavior)
      window.localStorage.setItem('employee', JSON.stringify(loginData.employee));
      window.localStorage.setItem('role', loginData.role);

      // Step 3: Verify stored data
      const storedEmployee = JSON.parse(window.localStorage.getItem('employee') || '{}');
      const storedRole = window.localStorage.getItem('role');
      
      expect(storedEmployee.username).toBe('admin');
      expect(storedRole).toBe('Admin');

      // Step 4: Fetch employees (admin can view all employees)
      const employeesResponse = await fetch(`${API_BASE}/employees/`);
      expect(employeesResponse.ok).toBe(true);
      const employeesData = await employeesResponse.json();
      expect(Array.isArray(employeesData)).toBe(true);
    });

    it('should complete employee management flow', async () => {
      // Step 1: Login as admin
      const loginResponse = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
        }),
      });
      expect(loginResponse.ok).toBe(true);

      // Step 2: Create new employee
      const newEmployee = {
        username: `testemp${Date.now()}`,
        first_name: 'Test',
        last_name: 'Employee',
        position: 'Cashier',
        password: 'testpass123',
      };

      const createResponse = await fetch(`${API_BASE}/employees/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });
      expect(createResponse.ok).toBe(true);
      const createdEmployee = await createResponse.json();
      expect(createdEmployee.username).toBe(newEmployee.username);

      // Step 3: Update employee
      const updateResponse = await fetch(`${API_BASE}/employees/${createdEmployee.username}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: 'Updated',
        }),
      });
      expect(updateResponse.ok).toBe(true);
      const updatedEmployee = await updateResponse.json();
      expect(updatedEmployee.first_name).toBe('Updated');

      // Step 4: Delete employee
      const deleteResponse = await fetch(`${API_BASE}/employees/${createdEmployee.username}/`, {
        method: 'DELETE',
      });
      expect(deleteResponse.ok).toBe(true);
    });
  });

  describe('Cashier User Flow', () => {
    it('should complete cashier login flow', async () => {
      // Step 1: Login as cashier
      const loginResponse = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'cashier',
          password: 'cashier123',
        }),
      });

      expect(loginResponse.ok).toBe(true);
      const loginData = await loginResponse.json();
      expect(loginData.success).toBe(true);
      expect(loginData.role).toBe('Cashier');

      // Step 2: Store in localStorage
      window.localStorage.setItem('employee', JSON.stringify(loginData.employee));
      window.localStorage.setItem('role', loginData.role);

      // Step 3: Verify stored data
      const storedEmployee = JSON.parse(window.localStorage.getItem('employee') || '{}');
      const storedRole = window.localStorage.getItem('role');
      
      expect(storedEmployee.username).toBe('cashier');
      expect(storedRole).toBe('Cashier');
    });

    it('should complete sale transaction flow', async () => {
      // Step 1: Login as cashier
      const loginResponse = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'cashier',
          password: 'cashier123',
        }),
      });
      expect(loginResponse.ok).toBe(true);
      const loginData = await loginResponse.json();

      // Step 2: Fetch products
      const productsResponse = await fetch(`${API_BASE}/products/`);
      expect(productsResponse.ok).toBe(true);
      const products = await productsResponse.json();
      expect(products.length).toBeGreaterThan(0);

      // Step 3: Create sale transaction
      const saleProduct = products.find((p: any) => !p.is_rental) || products[0];
      const transaction = {
        type: 'SALE',
        cashier: loginData.employee.username,
        customer: null,
        coupon: null,
        total_before_tax: saleProduct.price,
        tax_amount: (parseFloat(saleProduct.price) * 0.06).toFixed(2),
        total_after_tax: (parseFloat(saleProduct.price) * 1.06).toFixed(2),
        items: [
          {
            product_id: saleProduct.id,
            quantity: 1,
            unit_price: saleProduct.price,
            line_total: saleProduct.price,
          },
        ],
      };

      const transactionResponse = await fetch(`${API_BASE}/transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });

      expect(transactionResponse.ok).toBe(true);
      const transactionData = await transactionResponse.json();
      expect(transactionData.type).toBe('SALE');
      expect(transactionData.items.length).toBe(1);
    });

    it('should complete rental transaction flow', async () => {
      // Step 1: Login as cashier
      const loginResponse = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'cashier',
          password: 'cashier123',
        }),
      });
      expect(loginResponse.ok).toBe(true);
      const loginData = await loginResponse.json();

      // Step 2: Create or get customer
      const customerPhone = `0300${Date.now()}`;
      const customerResponse = await fetch(`${API_BASE}/customers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: customerPhone }),
      });
      expect(customerResponse.ok).toBe(true);
      const customer = await customerResponse.json();

      // Step 3: Fetch rental products
      const productsResponse = await fetch(`${API_BASE}/products/`);
      expect(productsResponse.ok).toBe(true);
      const products = await productsResponse.json();
      const rentalProduct = products.find((p: any) => p.is_rental);
      
      if (rentalProduct) {
        // Step 4: Create rental transaction
        const transaction = {
          type: 'RENTAL',
          cashier: loginData.employee.username,
          customer: customer.id,
          total_before_tax: rentalProduct.price,
          tax_amount: '0.00',
          total_after_tax: rentalProduct.price,
          items: [
            {
              product_id: rentalProduct.id,
              quantity: 1,
              unit_price: rentalProduct.price,
              line_total: rentalProduct.price,
            },
          ],
        };

        const transactionResponse = await fetch(`${API_BASE}/transactions/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction),
        });

        expect(transactionResponse.ok).toBe(true);
        const transactionData = await transactionResponse.json();

        // Step 5: Create rental record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        
        const rental = {
          customer: customer.id,
          product_id: rentalProduct.id,
          rented_at: new Date().toISOString(),
          due_date: dueDate.toISOString().split('T')[0],
          is_returned: false,
          days_late: 0,
          late_fee: '0.00',
          rent_transaction: transactionData.id,
        };

        const rentalResponse = await fetch(`${API_BASE}/rentals/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rental),
        });

        expect(rentalResponse.ok).toBe(true);
        const rentalData = await rentalResponse.json();
        expect(rentalData.is_returned).toBe(false);
      }
    });
  });

  describe('Product Management Flow', () => {
    it('should complete product CRUD flow', async () => {
      // Step 1: Create product
      const newProduct = {
        id: Date.now(),
        name: 'Test Product',
        price: '99.99',
        is_rental: false,
      };

      const createResponse = await fetch(`${API_BASE}/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      expect(createResponse.ok).toBe(true);
      const createdProduct = await createResponse.json();
      const productId = createdProduct.id;

      // Step 2: Read product
      const readResponse = await fetch(`${API_BASE}/products/${productId}/`);
      expect(readResponse.ok).toBe(true);
      const readProduct = await readResponse.json();
      expect(readProduct.name).toBe(newProduct.name);

      // Step 3: Update product
      const updateResponse = await fetch(`${API_BASE}/products/${productId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Product' }),
      });
      expect(updateResponse.ok).toBe(true);
      const updatedProduct = await updateResponse.json();
      expect(updatedProduct.name).toBe('Updated Product');

      // Step 4: Delete product
      const deleteResponse = await fetch(`${API_BASE}/products/${productId}/`, {
        method: 'DELETE',
      });
      expect(deleteResponse.ok).toBe(true);
    });
  });

  describe('Coupon Application Flow', () => {
    it('should apply coupon to transaction', async () => {
      // Step 1: Fetch available coupons
      const couponsResponse = await fetch(`${API_BASE}/coupons/`);
      expect(couponsResponse.ok).toBe(true);
      const coupons = await couponsResponse.json();
      
      if (coupons.length > 0) {
        const activeCoupon = coupons.find((c: any) => c.is_active);
        
        if (activeCoupon) {
          // Step 2: Calculate discount
          const subtotal = 100.0;
          const discountPercent = activeCoupon.discount_percent;
          const discount = subtotal * (discountPercent / 100);
          const afterDiscount = subtotal - discount;
          const tax = afterDiscount * 0.06;
          const total = afterDiscount + tax;

          expect(discount).toBeGreaterThan(0);
          expect(total).toBeLessThan(subtotal * 1.06);
        }
      }
    });
  });
});

