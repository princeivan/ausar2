import base64
import requests
from datetime import datetime
from django.conf import settings
import json
from stripe.error import InvalidRequestError
from rest_framework import status
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.utils.dateparse import parse_datetime
import logging
from django.shortcuts import render, get_object_or_404
from rest_framework.response import Response 
from django.utils import timezone
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes, parser_classes
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, permissions
from django.db.models import Q
from django.views import View
from rest_framework.views import APIView
from django.contrib.auth import authenticate
import stripe
from django.db.models import Sum, Count, Q, F
from rest_framework_simplejwt.tokens import RefreshToken
from api.pagination import CustomPagination
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.cache import cache
from django.views.decorators.http import require_http_methods
from rest_framework.throttling import UserRateThrottle
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from . services import PaymentService
from .authentication import CustomJWTAuthentication


logger = logging.getLogger(__name__)
from .models import (Categories, Product, Order,OrderItem, ShippingAddress,
        SliderData, User, Testimonials, BrandingRequest, BrandingFile,  
        Payment, PaymentWebhook)
from .serializers import (CustomTokenObtainPairSerializer, UserSerializer, CategorySerializer, 
                          ProductSerializer, TestimonialsSerializer, OrderSerializer, OrderItemSerializer,
                          ShippingAddressSerializer, SliderDataSerializer, UserProfileSerializer, 
                          BrandingRequestSerializer, PaymentSerializer, MPesaPaymentSerializer, 
                          StripePaymentSerializer, PaymentStatusSerializer,DashboardStatsSerializer, SalesDataSerializer,
                          CategoryDataSerializer,RecentOrderSerializer)

payment_service = PaymentService()
from .services import (
    DashboardAnalyticsService,
)

stripe.default_http_client = stripe.http_client.RequestsClient(verify_ssl_certs=False)

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
        
        serializer = self.get_serializer(data=request.data)
        try:
           serializer.is_valid(raise_exception=True)
        except Exception as e:
           cache.set(cache_key, attempts+1, 300)
           return Response({'error': str(e)}, status=400)
        
        user = serializer.user
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        response = Response({'success': True})
        #Htponly cookie for access token
        response.set_cookie(
            key='access',
            value=str(access),          
            httponly=True,
            secure=True,
            samesite='Lax',
        )
        #HttpOnly cookie for refresh token
        response.set_cookie(
            key='refresh',
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite='Lax',
        )
        cache.delete(cache_key)
        return response
class LogoutView(APIView):
    def post(Self, request):
        response = Response({'detail': 'Logout successful'}, status=200)
        response.delete_cookie(settings.SIMPLE_JWT["AUTH_COOKIE"])
        response.delete_cookie(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])
        return response
            
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    throttle_classes = [CustomRateThrottle]
    
    def get_object(self):
        print("User in request:", self.request.user)
        return self.request.user
    
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(request, username=email, password=password)
    
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        response = Response({
            'message': 'Login successful',
            'user_id': str(user.id),
        }, status=status.HTTP_200_OK)
        
        # Set access token cookie
        response.set_cookie(
            key=settings.SIMPLE_JWT.get("AUTH_COOKIE", "access"),
            value=access_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
            path='/',
        )

        # Set refresh token cookie
        response.set_cookie(
            key=settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh"),
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
            path='/',
        )
        
        return response 
    else:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
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

@csrf_exempt
@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
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

class DashboardOverviewView(APIView):
    """
    Main dashboard overview API that returns all dashboard data
    """
    permission_classes = [AllowAny]
    authentication_classes = [CustomJWTAuthentication]
    
    def get(self, request):
        try:
            # Get all dashboard data
            stats = DashboardAnalyticsService.get_dashboard_stats()
            sales_data = DashboardAnalyticsService.get_sales_data()
            category_data = DashboardAnalyticsService.get_category_data()
            recent_orders = DashboardAnalyticsService.get_recent_orders()
            
            return Response({
                'stats': DashboardStatsSerializer(stats).data,
                'sales_data': SalesDataSerializer(sales_data, many=True).data,
                'category_data': CategoryDataSerializer(category_data, many=True).data,
                'recent_orders': RecentOrderSerializer(recent_orders, many=True).data,
                'timestamp': timezone.now()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to fetch dashboard data',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DashboardStatsView(APIView):
    """
    Get dashboard statistics only
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [CustomJWTAuthentication]
    
    def get(self, request):
        stats = DashboardAnalyticsService.get_dashboard_stats()
        return Response(DashboardStatsSerializer(stats).data)

class SalesChartView(APIView):
    """
    Get sales chart data
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [CustomJWTAuthentication]
    
    def get(self, request):
        months = int(request.query_params.get('months', 7))
        sales_data = DashboardAnalyticsService.get_sales_data(months)
        return Response(SalesDataSerializer(sales_data, many=True).data)

class CategoryChartView(APIView):
    """
    Get category distribution data
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [CustomJWTAuthentication]
    
    def get(self, request):
        category_data = DashboardAnalyticsService.get_category_data()
        return Response(CategoryDataSerializer(category_data, many=True).data)

class RecentOrdersView(APIView):
    """
    Get recent orders data
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [CustomJWTAuthentication]
    
    def get(self, request):
        limit = int(request.query_params.get('limit', 5))
        recent_orders = DashboardAnalyticsService.get_recent_orders(limit)
        return Response(RecentOrderSerializer(recent_orders, many=True).data)

# Advanced Analytics Views
class AdvancedAnalyticsView(APIView):
    """
    Advanced analytics for deeper insights
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [CustomJWTAuthentication]
    
    def get(self, request):
        # Get time period from query params
        period = request.query_params.get('period', 'month')  # month, week, day
        
        current_start, previous_start, previous_end, now = DashboardAnalyticsService.get_date_range(period)
        
        # Revenue by status
        revenue_by_status = Order.objects.filter(
            created_at__gte=current_start
        ).values('status').annotate(
            total=Sum('total_amount'),
            count=Count('id')
        )
        
        # Top products
        top_products = OrderItem.objects.filter(
            order__created_at__gte=current_start
        ).values(
            'product__name',
            'product__category__name'
        ).annotate(
            total_sold=Sum('quantity'),
            revenue=Sum(F('quantity') * F('price'))
        ).order_by('-revenue')[:10]
        
        # Customer analytics
        customer_stats = User.objects.filter(
            role='user'
        ).aggregate(
            total_customers=Count('id'),
            active_customers=Count('id', filter=Q(orders__created_at__gte=current_start))
        )
        
        return Response({
            'revenue_by_status': list(revenue_by_status),
            'top_products': list(top_products),
            'customer_stats': customer_stats,
            'period': period,
            'date_range': {
                'start': current_start,
                'end': now
            }
        })
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def adminProducts(request):
    if request.method == 'GET':
        try:
            search = request.query_params.get('search', '').strip()
            category = request.query_params.get('category', 'all').strip().lower()
            stock_filter = request.query_params.get('stock', 'all').strip().lower()

            products = Product.objects.all()

            if search:
                products = products.filter(title__icontains=search)

            if category and category != 'all':
                products = products.filter(category__name__icontains=category)

            if stock_filter == 'low':
                products = products.filter(countInStock__lte=20, countInStock__gt=0)
            elif stock_filter == 'out':
                products = products.filter(countInStock=0)
            elif stock_filter == 'medium':
                products = products.filter(countInStock__gt=20, countInStock__lte=100)
            elif stock_filter == 'high':
                products = products.filter(countInStock__gt=100)

            products = products.order_by('-Date_added')
            serializer = ProductSerializer(products, many=True)

            total_products = products.count()
            total_stock = products.aggregate(Sum('countInStock'))['countInStock__sum'] or 0
            low_stock = products.filter(countInStock__lte=20, countInStock__gt=0).count()
            out_of_stock = products.filter(countInStock=0).count()
            avg_stock = round(total_stock / total_products) if total_products > 0 else 0

            analytics = {
                "total_products": total_products,
                "total_stock": total_stock,
                "low_stock": low_stock,
                "out_of_stock": out_of_stock,
                "avg_stock": avg_stock,
            }

            return Response({
                "products": serializer.data,
                "analytics": analytics
            })
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
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_for_order(request, order_id):
    """Pay for an existing order"""
    try:
        order = Order.objects.get(orderId=order_id, user=request.user)
        
        # Check if order is already paid
        if order.isPaid:
            return Response(
                {'error': 'Order is already paid'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_method = request.data.get('payment_method')
        phone_number = request.data.get('phone_number')  # Required for M-Pesa
        
        if not payment_method or payment_method not in ['mpesa', 'visa']:
            return Response(
                {'error': 'Valid payment_method is required (mpesa or visa)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if payment_method == 'mpesa' and not phone_number:
            # Use user's phone number if not provided
            phone_number = order.user.phone_number
            if not phone_number:
                return Response(
                    {'error': 'Phone number is required for M-Pesa payments'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        result = payment_service.create_order_payment(
            order_id=order_id,
            payment_method=payment_method,
            phone_number=phone_number
        )
        
        if result['success']:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_mpesa_payment(request):
    """Initiate M-Pesa STK Push payment (standalone)"""
    serializer = MPesaPaymentSerializer(data=request.data)
    
    if serializer.is_valid():
        result = payment_service.create_mpesa_payment(
            user=request.user,
            amount=serializer.validated_data['amount'],
            phone_number=serializer.validated_data['phone_number'],
            description=serializer.validated_data.get('description', 'Payment')
        )
        
        if result['success']:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_stripe_payment(request):
    """Initiate Stripe payment (standalone)"""
    serializer = StripePaymentSerializer(data=request.data)
    
    if serializer.is_valid():
        result = payment_service.create_stripe_payment(
            user=request.user,
            amount=serializer.validated_data['amount'],
            currency=serializer.validated_data['currency'],
            customer_email=serializer.validated_data.get('customer_email', request.user.email)
        )
        
        if result['success']:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, payment_id):
    """Get payment status"""
    try:
        payment = Payment.objects.get(id=payment_id, user=request.user)
        serializer = PaymentStatusSerializer(payment)
        return Response(serializer.data)
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_payment_status(request, order_id):
    """Get payment status for a specific order"""
    try:
        order = Order.objects.get(orderId=order_id, user=request.user)
        payments = Payment.objects.filter(order=order).order_by('-created_at')
        
        if payments.exists():
            latest_payment = payments.first()
            serializer = PaymentStatusSerializer(latest_payment)
            return Response({
                'order_id': str(order.id),
                'order_number': order.orderId,
                'is_paid': order.isPaid,
                'payment': serializer.data
            })
        else:
            return Response({
                'order_id': str(order.id),
                'order_number': order.orderId,
                'is_paid': order.isPaid,
                'payment': None,
                'message': 'No payment initiated for this order'
            })
            
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_payments(request):
    """Get user's payment history"""
    payments = Payment.objects.filter(user=request.user)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_orders_with_payments(request):
    """Get user's orders with their payment status"""
    orders = Order.objects.filter(user=request.user).prefetch_related('payments')
    
    order_data = []
    for order in orders:
        latest_payment = order.payments.first() if order.payments.exists() else None
        
        order_info = {
            'id': str(order.id),
            'order_number': order.orderId,
            'total_price': order.totalPrice,
            'is_paid': order.isPaid,
            'status': order.status,
            'created_at': order.createdAt,
            'payment_method': order.paymentmethod,
            'payment': None
        }
        
        if latest_payment:
            order_info['payment'] = {
                'id': str(latest_payment.id),
                'status': latest_payment.status,
                'reference': latest_payment.reference_number,
                'created_at': latest_payment.created_at
            }
        
        order_data.append(order_info)
    
    return Response(order_data)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def mpesa_callback(request):
    """Handle M-Pesa callback"""
    try:
        
        callback_data = json.loads(request.body.decode('utf-8'))
               
        # Log the callback for debugging
        PaymentWebhook.objects.create(
            webhook_type='mpesa_callback',
            raw_data=callback_data,
            payment=None  
        )
        
        # Process the callback
        success = payment_service.process_mpesa_callback(callback_data)
        
        if success:
                return Response({
                "ResultCode": 0,
                "ResultDesc": "Accepted"
                }, status=200)
        else:
            return Response({
                "ResultCode": 1,
                "ResultDesc": "Failed to process callback"
            }, status=400)
            
    except Exception as e:
        return Response({
            "ResultCode": 1,
            "ResultDesc": f"Callback Error: {str(e)}"
        }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(View):
    """Handle Stripe webhooks"""
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_CONFIG['WEBHOOK_SECRET']
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError:
            return Response("Invalid payload", status=400)
        except stripe.error.SignatureVerificationError:
            return Response("Invalid signature", status=400)
        
        # Log the webhook
        PaymentWebhook.objects.create(
            webhook_type='stripe_webhook',
            raw_data=event,
            payment=None
        )
        
        # Handle the event
        if event['type'] in ['payment_intent.succeeded', 'payment_intent.payment_failed']:
            payment_intent = event['data']['object']
            payment_intent_id = payment_intent['id']
            
            success = payment_service.process_stripe_webhook(event, payment_intent_id)
            
            if success:
                return Response("OK", status=200)
            else:
                return Response("Failed to process webhook", status=400)
        
        return Response("Event not handled", status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_methods(request):
    """Get available payment methods"""
    methods = [
        {
            'id': 'mpesa',
            'name': 'M-Pesa',
            'description': 'Pay with M-Pesa STK Push',
            'supported_currencies': ['KES'],
            'icon': '📱',
            'requires_phone': True
        },
        {
            'id': 'visa',
            'name': 'Visa/Mastercard',
            'description': 'Pay with credit or debit card',
            'supported_currencies': ['USD', 'KES', 'EUR', 'GBP'],
            'icon': '💳',
            'requires_phone': False
        }
    ]
    
    return Response(methods)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_stripe_payment(request):
    payment_intent_id = request.data.get('payment_intent_id')
    print("Received payment_intent_id:", payment_intent_id)

    if not payment_intent_id:
        return Response({'error': 'payment_intent_id is required'}, status=400)

    try:
        payment = Payment.objects.get(
            stripe_payment_intent_id=payment_intent_id,
            user=request.user
        )

        intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        if intent.status == 'succeeded':
            payment.status = 'completed'
            payment.save()

            if payment.order:
                payment.order.isPaid = True
                payment.order.paidAt = timezone.now()
                payment.order.status = 'pending'
                payment.order.save()

            return Response({
                'success': True,
                'payment_status': 'completed',
                'message': 'Payment completed successfully',
                'order_id': payment.order.id if payment.order else None
            })
        else:
            return Response({
                'success': False,
                'payment_status': intent.status,
                'message': f'Payment status: {intent.status}'
            })

    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=404)

    except InvalidRequestError as e:
        return Response({'error': f'Stripe error: {str(e)}'}, status=400)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def retry_payment(request, payment_id):
#     """Retry a failed payment"""
#     try:
#         payment = Payment.objects.get(id=payment_id, user=request.user)
        
#         if payment.status not in ['failed', 'cancelled']:
#             return Response(
#                 {'error': 'Can only retry failed or cancelled payments'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Create new payment with same details
#         if payment.payment_method == 'mpesa':
#             phone_number = request.data.get('phone_number', payment.mpesa_phone_number)
#             result = payment_service.create_mpesa_payment(
#                 user=payment.user,
#                 amount=payment.amount,
#                 phone_number=phone_number,
#                 description=payment.description,
#                 order=payment.order
#             )
#         else:  # visa
#             result = payment_service.create_stripe_payment(
#                 user=payment.user,
#                 amount=payment.amount,
#                 currency=payment.currency.lower(),
#                 customer_email=payment.user.email,
#                 order=payment.order
#             )
        
#         if result['success']:
#             return Response(result, status=status.HTTP_201_CREATED)
#     catch: 
        