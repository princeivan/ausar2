import base64
import requests
from datetime import datetime
from django.conf import settings
import json
from rest_framework import status
from django.views.decorators.csrf import csrf_protect
from django.utils.dateparse import parse_datetime
import logging
from django.shortcuts import render, get_object_or_404
from rest_framework.response import Response 
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, permissions
from django.db.models import Q
from api.pagination import CustomPagination
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.cache import cache
from django.views.decorators.http import require_http_methods
from rest_framework.throttling import UserRateThrottle
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

logger = logging.getLogger(__name__)
from .models import Categories, Product, Order, ShippingAddress, SliderData, User, Testimonials, BrandingRequest, BrandingFile
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, CategorySerializer, ProductSerializer, TestimonialsSerializer, OrderSerializer, OrderItemSerializer, ShippingAddressSerializer, SliderDataSerializer, UserProfileSerializer, BrandingRequestSerializer

class CustomRateThrottle(UserRateThrottle):
    rate = '5/minute'  # 5 requests per minute

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer 
    permission_classes = [AllowAny]
    throttle_classes = [CustomRateThrottle]

    def perform_create(self, serializer):
        # Validate email format
        try:
            validate_email(serializer.validated_data['email'])
        except DjangoValidationError:
            raise ValidationError({'email': 'Invalid email format'})
        
        # Check if email already exists
        if User.objects.filter(email=serializer.validated_data['email']).exists():
            raise ValidationError({'email': 'Email already exists'})
        
        serializer.save()

class CustomTokenObtainPair(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [CustomRateThrottle]

    def post(self, request, *args, **kwargs):
        # Check for brute force attempts
        ip = request.META.get('REMOTE_ADDR')
        cache_key = f'login_attempts_{ip}'
        attempts = cache.get(cache_key, 0)
        
        if attempts >= 5:
            return Response(
                {'error': 'Too many login attempts. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            cache.delete(cache_key)
        else:
            cache.set(cache_key, attempts + 1, 300)  # 5 minutes timeout
            
        return response

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [CustomRateThrottle]

    def get_object(self):
        return self.request.user

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])

def getProducts(request):
    
    if request.method == 'GET':
        query = request.GET.get('query', '')
        # Sanitize query input
        query = query.strip()[:100]  # Limit query length
        
        products = Product.objects.filter(
            Q(title__icontains=query) | 
            Q(category__name__icontains=query)
        )
        
        paginator = CustomPagination()
        paginated_products = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(paginated_products, many=True, context={'request': request})
        
        return paginator.get_paginated_response(serializer.data)
    
    if request.method == 'POST':
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can create products'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT', 'DELETE'])
@permission_classes([AllowAny])
def getProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
    except Product.DoesNotExist:
        raise NotFound(detail="Product not found")
    
    if request.method == 'GET':
        serializer = ProductSerializer(product, many=False, context={'request': request})
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'DELETE']:
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can modify products'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if request.method == 'PUT':
            serializer = ProductSerializer(product, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:  # DELETE
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def getFlashSales(request):
    flash_sales = Product.objects.filter(flash_sale=True, flash_sale_end__gt=now())
    paginator = CustomPagination()
    paginated_products = paginator.paginate_queryset(flash_sales, request)
    serializer = ProductSerializer(paginated_products, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
def getBestSellers(request):
    best_sellers = Product.objects.filter(best_seller=True).order_by('-numReviews')
    paginator = CustomPagination()
    paginated_products = paginator.paginate_queryset(best_sellers, request)
    serializer = ProductSerializer(paginated_products, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def getCategories(request):
    cats = Categories.objects.all()
    serializer = CategorySerializer(cats, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([AllowAny])
def getTestimonials(request):
    testimony = Testimonials.objects.all()
    serializer = TestimonialsSerializer(testimony, many=True, context={'request': request})
    return Response(serializer.data)
        
@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def getBrandingRequest(request):
    # Validate file size and type
    files = request.FILES.getlist('branding_files')
    for file in files:
        if file.size > 5 * 1024 * 1024:  # 5MB limit
            return Response(
                {'error': 'File size too large. Maximum size is 5MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not file.content_type.startswith(('image/', 'application/pdf')):
            return Response(
                {'error': 'Invalid file type. Only images and PDFs are allowed'},
                status=status.HTTP_400_BAD_REQUEST
            )

    serializer = BrandingRequestSerializer(data=request.data)
    if serializer.is_valid():
        branding_request = serializer.save()
        files = request.FILES.getlist('branding_files')
        for file in files:
            BrandingFile.objects.create(branding_request=branding_request, file=file)
            
        return Response({"message":"Quote request submitted!"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
@csrf_protect
def create_order(request):
    if request.method == 'GET':
        orders = Order.objects.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            return Response({'orderId': order.id, **serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def adminProducts(request):
    if request.method == 'GET':
        try:
            products = Product.objects.all().order_by('-Date_added')
            serializer = ProductSerializer(products, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    elif request.method == 'POST':
        try:
            serializer = ProductSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def adminProductDetail(request, pk):
    try:
        product = get_object_or_404(Product, id=pk)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    elif request.method == 'PUT':
        try:
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    elif request.method == 'DELETE':
        try:
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )