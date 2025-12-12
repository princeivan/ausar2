from django.urls import path, include
from .import views
from api.views import UserProfileView , LogoutView, CategoryViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('products/', views.ProductAPIView.as_view(), name='products'),
    path('products/<str:pk>/', views.getProduct, name='product'),
    path('admin/products/', views.adminProducts, name='admin-products'),
    path('admin/products/<str:pk>/', views.adminProductDetail, name='admin-product-detail'),
    path('flash-sales/', views.getFlashSales, name='flash-sales'),
    path('login/', views.login_view, name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('best-sellers/', views.getBestSellers, name='best-sellers'),
    path('testimonials/', views.getTestimonials, name="testimonials"),
    path("submit-branding/", views.getBrandingRequest, name="submit-branding"),
    path('orders/', views.create_order, name='create_order'),
    
    
    # Dashboard APIs
    path('admin/dashboard/', views.DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('admin/dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('admin/dashboard/sales/', views.SalesChartView.as_view(), name='sales-chart'),
    path('admin/dashboard/categories/', views.CategoryChartView.as_view(), name='category-chart'),
    path('admin/dashboard/orders/recent/', views.RecentOrdersView.as_view(), name='recent-orders'),
    path('admin/dashboard/analytics/', views.AdvancedAnalyticsView.as_view(), name='advanced-analytics'),
    
    # Standalone payment initiation endpoints
    path('mpesa/initiate/', views.initiate_mpesa_payment, name='initiate_mpesa'),
    path('stripe/initiate/', views.initiate_stripe_payment, name='initiate_stripe'),
    
    # Payment status and management
    path('<uuid:payment_id>/status/', views.payment_status, name='payment_status'),
    # path('<uuid:payment_id>/retry/', views.retry_payment, name='retry_payment'),
    path('payments/confirm-stripe-payment/', views.confirm_stripe_payment, name='confirm_stripe'),
    path('payments/pay-for-order/<str:order_id>/', views.pay_for_order, name='pay_for_order'),
    path('payments/order-payment-status/<str:order_id>/', views.order_payment_status, name='order_payment_status'),
    
    # User payment history
    path('history/', views.user_payments, name='user_payments'),
    path('orders/', views.user_orders_with_payments, name='user_orders_with_payments'),
    
    # Payment methods info
    path('methods/', views.payment_methods, name='payment_methods'),
    
    # Webhook endpoints
    path('mpesa-callback/', views.mpesa_callback, name='mpesa_callback'),
    path('stripe-webhook/', views.StripeWebhookView.as_view(), name='stripe_webhook'),
    path('', include(router.urls)),
]

