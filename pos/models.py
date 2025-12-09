from __future__ import annotations

from django.db import models


class Employee(models.Model):
    """Application-level user mapped from legacy employeeDatabase.txt."""

    username = models.CharField(max_length=32, primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    position = models.CharField(max_length=32)  # e.g. "Admin", "Cashier"
    password_hash = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "employees"

    def __str__(self) -> str:
        return f"{self.username} - {self.first_name} {self.last_name}"


class Customer(models.Model):
    """Customer identified primarily by phone number."""

    phone_number = models.CharField(max_length=32, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "customers"

    def __str__(self) -> str:
        return self.phone_number


class Product(models.Model):
    """Unified catalog for both sale and rental items."""

    id = models.IntegerField(primary_key=True)  # legacy itemID
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_rental = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"

    def __str__(self) -> str:
        return f"{self.id} - {self.name}"


class Inventory(models.Model):
    """Tracks current stock per product."""

    product = models.OneToOneField(
        Product, on_delete=models.CASCADE, related_name="inventory"
    )
    quantity = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "inventory"

    def __str__(self) -> str:
        return f"{self.product_id}: {self.quantity}"


class Coupon(models.Model):
    """Simple percentage-based coupon."""

    code = models.CharField(max_length=32, primary_key=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "coupons"

    def __str__(self) -> str:
        return self.code


class Transaction(models.Model):
    """Represents a sale, rental, or return."""

    TYPE_SALE = "SALE"
    TYPE_RENTAL = "RENTAL"
    TYPE_RETURN_RENTAL = "RETURN_RENTAL"
    TYPE_RETURN_SALE = "RETURN_SALE"

    TRANSACTION_TYPES = [
        (TYPE_SALE, "Sale"),
        (TYPE_RENTAL, "Rental"),
        (TYPE_RETURN_RENTAL, "Rental Return"),
        (TYPE_RETURN_SALE, "Sale Return"),
    ]

    type = models.CharField(max_length=32, choices=TRANSACTION_TYPES)
    cashier = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions"
    )
    customer = models.ForeignKey(
        Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions"
    )
    coupon = models.ForeignKey(
        Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    total_before_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_after_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "transactions"

    def __str__(self) -> str:
        return f"{self.get_type_display()} #{self.pk}"


class TransactionItem(models.Model):
    """Line items belonging to a transaction."""

    transaction = models.ForeignKey(
        Transaction, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="transaction_items"
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "transaction_items"

    def __str__(self) -> str:
        return f"{self.transaction_id} x {self.product_id}"


class Rental(models.Model):
    """Rental lifecycle for a single rented item."""

    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="rentals"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="rentals"
    )
    rented_at = models.DateTimeField()
    due_date = models.DateField()
    returned_at = models.DateTimeField(null=True, blank=True)
    is_returned = models.BooleanField(default=False)
    days_late = models.IntegerField(null=True, blank=True)
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rent_transaction = models.ForeignKey(
        Transaction,
        on_delete=models.PROTECT,
        related_name="rental_records",
    )
    return_transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="return_records",
    )

    class Meta:
        db_table = "rentals"

    def __str__(self) -> str:
        return f"Rental {self.pk} - {self.customer} -> {self.product}"


class EmployeeLog(models.Model):
    """Structured audit trail of employee logins/logouts."""

    ACTION_LOGIN = "LOGIN"
    ACTION_LOGOUT = "LOGOUT"

    ACTION_CHOICES = [
        (ACTION_LOGIN, "Login"),
        (ACTION_LOGOUT, "Logout"),
    ]

    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="logs"
    )
    action = models.CharField(max_length=16, choices=ACTION_CHOICES)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "employee_log"

    def __str__(self) -> str:
        return f"{self.employee_id} {self.action} @ {self.created_at}"


