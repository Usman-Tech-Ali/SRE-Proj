from django.contrib.auth.hashers import check_password
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from . import models, serializers


@api_view(["POST"])
def login_view(request):
    """
    Authenticate employee by username + password.
    Returns: { "success": true, "role": "Admin"|"Cashier", "employee": {...} }
    """
    username = request.data.get("username", "")
    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {"success": False, "message": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        employee = models.Employee.objects.get(username=username, is_active=True)
    except models.Employee.DoesNotExist:
        return Response(
            {"success": False, "message": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Check password using Django's hasher (legacy txt passwords were plain, but now hashed)
    if not check_password(password, employee.password_hash):
        return Response(
            {"success": False, "message": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Log the login event
    models.EmployeeLog.objects.create(
        employee=employee,
        action=models.EmployeeLog.ACTION_LOGIN,
        message=f"{employee.first_name} {employee.last_name} logged in",
    )

    # Return role + employee data
    role = employee.position  # "Admin" or "Cashier"
    return Response(
        {
            "success": True,
            "role": role,
            "employee": {
                "username": employee.username,
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "position": employee.position,
            },
        }
    )


@api_view(["POST"])
def logout_view(request):
    """
    Log employee logout event.
    Expects: { "username": "..." }
    """
    username = request.data.get("username", "")
    if not username:
        return Response(
            {"success": False, "message": "Username required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        employee = models.Employee.objects.get(username=username)
        models.EmployeeLog.objects.create(
            employee=employee,
            action=models.EmployeeLog.ACTION_LOGOUT,
            message=f"{employee.first_name} {employee.last_name} logged out",
        )
        return Response({"success": True})
    except models.Employee.DoesNotExist:
        return Response(
            {"success": False, "message": "Employee not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    CRUD for employees (admin/cashier management).
    """

    queryset = models.Employee.objects.all()
    serializer_class = serializers.EmployeeSerializer
    lookup_field = "username"  # Use username as the lookup field instead of default 'pk'


class ProductViewSet(viewsets.ModelViewSet):
    """
    CRUD API for products (sale and rental items).
    """

    queryset = models.Product.objects.all().order_by("id")
    serializer_class = serializers.ProductSerializer


class InventoryViewSet(viewsets.ModelViewSet):
    """
    Manage inventory quantities per product.
    """

    queryset = models.Inventory.objects.select_related("product").all()
    serializer_class = serializers.InventorySerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = models.Customer.objects.all().order_by("-created_at")
    serializer_class = serializers.CustomerSerializer


class CouponViewSet(viewsets.ModelViewSet):
    queryset = models.Coupon.objects.all()
    serializer_class = serializers.CouponSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    """
    Create and list transactions (sales, rentals, returns) including line items.
    """

    queryset = models.Transaction.objects.prefetch_related("items", "items__product")
    serializer_class = serializers.TransactionSerializer


class RentalViewSet(viewsets.ModelViewSet):
    queryset = models.Rental.objects.select_related("customer", "product")
    serializer_class = serializers.RentalSerializer
