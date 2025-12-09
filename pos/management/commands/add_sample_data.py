from django.core.management.base import BaseCommand
from pos.models import Product, Customer, Coupon, Inventory
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = "Add sample data for testing"

    def handle(self, *args, **options):
        self.stdout.write("Adding sample data...\n")

        # Add Products (Sale Items)
        sale_products = [
            {"id": 1001, "name": "Laptop Dell XPS 13", "price": 1299.99, "is_rental": False},
            {"id": 1002, "name": "iPhone 15 Pro", "price": 999.99, "is_rental": False},
            {"id": 1003, "name": "Samsung Galaxy S24", "price": 899.99, "is_rental": False},
            {"id": 1004, "name": "MacBook Air M2", "price": 1499.99, "is_rental": False},
            {"id": 1005, "name": "iPad Pro 12.9", "price": 1099.99, "is_rental": False},
            {"id": 1006, "name": "AirPods Pro", "price": 249.99, "is_rental": False},
            {"id": 1007, "name": "Apple Watch Series 9", "price": 399.99, "is_rental": False},
            {"id": 1008, "name": "Sony WH-1000XM5", "price": 349.99, "is_rental": False},
            {"id": 1009, "name": "Kindle Paperwhite", "price": 139.99, "is_rental": False},
            {"id": 1010, "name": "Logitech MX Master 3", "price": 99.99, "is_rental": False},
        ]

        for prod_data in sale_products:
            product, created = Product.objects.get_or_create(
                id=prod_data["id"],
                defaults={
                    "name": prod_data["name"],
                    "price": prod_data["price"],
                    "is_rental": prod_data["is_rental"],
                },
            )
            if created:
                self.stdout.write(f"  ✓ Added product: {product.name}")
            else:
                self.stdout.write(f"  - Product exists: {product.name}")

        # Add Rental Products
        rental_products = [
            {"id": 2001, "name": "Camera Canon EOS R5", "price": 50.00, "is_rental": True},
            {"id": 2002, "name": "DJI Mavic 3 Drone", "price": 75.00, "is_rental": True},
            {"id": 2003, "name": "Gaming Laptop ASUS ROG", "price": 45.00, "is_rental": True},
            {"id": 2004, "name": "GoPro Hero 12", "price": 30.00, "is_rental": True},
            {"id": 2005, "name": "PlayStation 5", "price": 25.00, "is_rental": True},
            {"id": 2006, "name": "Xbox Series X", "price": 25.00, "is_rental": True},
            {"id": 2007, "name": "Projector Epson 4K", "price": 40.00, "is_rental": True},
            {"id": 2008, "name": "Sound System Bose", "price": 35.00, "is_rental": True},
        ]

        for prod_data in rental_products:
            product, created = Product.objects.get_or_create(
                id=prod_data["id"],
                defaults={
                    "name": prod_data["name"],
                    "price": prod_data["price"],
                    "is_rental": prod_data["is_rental"],
                },
            )
            if created:
                self.stdout.write(f"  ✓ Added rental: {product.name}")
            else:
                self.stdout.write(f"  - Rental exists: {product.name}")

        # Add Inventory
        self.stdout.write("\nAdding inventory...")
        for product in Product.objects.all():
            inventory, created = Inventory.objects.get_or_create(
                product=product,
                defaults={"quantity": 50 if not product.is_rental else 10},
            )
            if created:
                self.stdout.write(f"  ✓ Added inventory for: {product.name} (Qty: {inventory.quantity})")

        # Add Customers
        self.stdout.write("\nAdding customers...")
        customers_data = [
            "03001234567",
            "03011234567",
            "03021234567",
            "03331234567",
            "03451234567",
        ]

        for phone in customers_data:
            customer, created = Customer.objects.get_or_create(
                phone_number=phone
            )
            if created:
                self.stdout.write(f"  ✓ Added customer: {customer.phone_number}")
            else:
                self.stdout.write(f"  - Customer exists: {customer.phone_number}")

        # Add Coupons
        self.stdout.write("\nAdding coupons...")
        coupons_data = [
            {"code": "SAVE10", "discount_percent": 10, "is_active": True},
            {"code": "SAVE20", "discount_percent": 20, "is_active": True},
            {"code": "SUMMER25", "discount_percent": 25, "is_active": True},
            {"code": "EXPIRED", "discount_percent": 50, "is_active": False},
        ]

        for coupon_data in coupons_data:
            coupon, created = Coupon.objects.get_or_create(
                code=coupon_data["code"],
                defaults={
                    "discount_percent": coupon_data["discount_percent"],
                    "is_active": coupon_data["is_active"],
                    "valid_from": datetime.now(),
                    "valid_to": datetime.now() + timedelta(days=365),
                },
            )
            if created:
                self.stdout.write(f"  ✓ Added coupon: {coupon.code} ({coupon.discount_percent}% off)")
            else:
                self.stdout.write(f"  - Coupon exists: {coupon.code}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ Sample data added successfully!\n"
                f"   - {Product.objects.filter(is_rental=False).count()} sale products\n"
                f"   - {Product.objects.filter(is_rental=True).count()} rental products\n"
                f"   - {Customer.objects.count()} customers\n"
                f"   - {Coupon.objects.count()} coupons\n"
            )
        )

