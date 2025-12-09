from django.contrib import admin

from . import models


@admin.register(models.Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("username", "first_name", "last_name", "position", "is_active")
    search_fields = ("username", "first_name", "last_name")
    list_filter = ("position", "is_active")


@admin.register(models.Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "phone_number", "created_at")
    search_fields = ("phone_number",)


@admin.register(models.Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price", "is_rental")
    search_fields = ("name",)
    list_filter = ("is_rental",)


@admin.register(models.Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("product", "quantity")


@admin.register(models.Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_percent", "is_active")
    list_filter = ("is_active",)


class TransactionItemInline(admin.TabularInline):
    model = models.TransactionItem
    extra = 0


@admin.register(models.Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "cashier", "customer", "created_at", "total_after_tax")
    list_filter = ("type", "created_at")
    inlines = [TransactionItemInline]


@admin.register(models.Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "product", "rented_at", "due_date", "is_returned")
    list_filter = ("is_returned",)


@admin.register(models.EmployeeLog)
class EmployeeLogAdmin(admin.ModelAdmin):
    list_display = ("employee", "action", "created_at")
    list_filter = ("action", "created_at")


