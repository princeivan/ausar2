from django.urls import path
from .import views
from api.views import UserProfileView 

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('products/', views.getProducts, name='products'),
    path('products/<str:pk>/', views.getProduct, name='product'),
    path('admin/products/', views.adminProducts, name='admin-products'),
    path('admin/products/<str:pk>/', views.adminProductDetail, name='admin-product-detail'),
    path('flash-sales/', views.getFlashSales, name='flash-sales'),
    path('best-sellers/', views.getBestSellers, name='best-sellers'),
    path('categories/', views.getCategories, name='categories'),
    path('testimonials/', views.getTestimonials, name="testimonials"),
    path("submit-branding/", views.getBrandingRequest, name="submit-branding"),
    path('orders/', views.create_order, name='create_order'),
]
