from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from . import models


class EmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = models.Employee
        fields = [
            "username",
            "first_name",
            "last_name",
            "position",
            "is_active",
            "created_at",
            "password",  # write_only
        ]
        read_only_fields = ["created_at"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        employee = models.Employee(**validated_data)
        if password:
            employee.password_hash = make_password(password)
        employee.save()
        return employee

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.password_hash = make_password(password)
        instance.save()
        return instance


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Customer
        fields = ["id", "phone_number", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Product
        fields = ["id", "name", "price", "is_rental"]


class InventorySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=models.Product.objects.all(), write_only=True
    )

    class Meta:
        model = models.Inventory
        fields = ["product", "product_id", "quantity"]


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Coupon
        fields = ["code", "discount_percent", "valid_from", "valid_to", "is_active"]


class TransactionItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=models.Product.objects.all(), write_only=True
    )

    class Meta:
        model = models.TransactionItem
        fields = [
            "id",
            "product",
            "product_id",
            "quantity",
            "unit_price",
            "line_total",
        ]


class TransactionSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True)

    class Meta:
        model = models.Transaction
        fields = [
            "id",
            "type",
            "cashier",
            "customer",
            "coupon",
            "created_at",
            "total_before_tax",
            "tax_amount",
            "total_after_tax",
            "notes",
            "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        transaction = models.Transaction.objects.create(**validated_data)
        for item_data in items_data:
            models.TransactionItem.objects.create(transaction=transaction, **item_data)
        return transaction


class RentalSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=models.Product.objects.all(), write_only=True
    )

    class Meta:
        model = models.Rental
        fields = [
            "id",
            "customer",
            "product",
            "product_id",
            "rented_at",
            "due_date",
            "returned_at",
            "is_returned",
            "days_late",
            "late_fee",
            "rent_transaction",
            "return_transaction",
        ]
