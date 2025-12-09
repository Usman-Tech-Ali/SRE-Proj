from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"employees", views.EmployeeViewSet, basename="employee")
router.register(r"products", views.ProductViewSet, basename="product")
router.register(r"inventory", views.InventoryViewSet, basename="inventory")
router.register(r"customers", views.CustomerViewSet, basename="customer")
router.register(r"coupons", views.CouponViewSet, basename="coupon")
router.register(r"transactions", views.TransactionViewSet, basename="transaction")
router.register(r"rentals", views.RentalViewSet, basename="rental")


urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("", include(router.urls)),
]
