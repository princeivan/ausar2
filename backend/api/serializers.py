from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from  .models import Categories, Payment, Product, Order, OrderItem, ShippingAddress, SliderData,User,Testimonials, BrandingRequest, BrandingFile
import requests
from django.core.files.base import ContentFile
import re
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from collections import defaultdict
import calendar

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
    
        token['is_admin'] = user.is_staff or user.is_superuser
        
        
        return token 
    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            'email': self.user.email,
            'is_admin':self.user.is_staff or self.user.is_superuser
        }) 
        return data
        
class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    permissions =serializers.SerializerMethodField(read_only=True)
    avatar = serializers.ImageField(required=False)
    
    class Meta:
        model = User 
        fields = ["id", "username", "first_name", "last_name", "avatar", "email", "phone_number", "password", "confirm_password", "role","permissions"]
        extra_kwargs = {
            "password": {"write_only": True},
            "username": {"required": True},
            "email": {"required": True},
            "phone_number": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True}
        }
    def get_permissions(self, obj):
        return obj.get_permissions()
    
    def validate_username(self, value):
        # Username should be 3-20 characters, alphanumeric with underscores
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', value):
            raise serializers.ValidationError(
                "Username must be 3-20 characters and can only contain letters, numbers, and underscores"
            )
        
        # Check if username already exists
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        
        return value

    def validate_phone_number(self, value):
        # Phone number should be 10 digits
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("Please enter a valid 10-digit phone number")
        
        # Check if phone number already exists
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already registered")
        
        return value

    def validate_email(self, value):
        # Email format validation
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', value):
            raise serializers.ValidationError("Please enter a valid email address")
        
        # Check if email already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        
        return value

    def validate_password(self, value):
        # Password validation
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$', value):
            raise serializers.ValidationError(
                "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character"
            )
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(**validated_data)
        return user
        
class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = ['town', 'address','postalCode','country','shippingPrice']
        
class UserProfileSerializer(serializers.ModelSerializer):
    shipping_address = ShippingAddressSerializer(required=False)
    shipping_address_data = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User 
        fields = ["id", "username", "full_name", "first_name", "last_name", 
                 "email", "phone_number","role", "permissions","avatar","shipping_address","shipping_address_data"]
        read_only_fields = ["email","username"]  
        
    def get_permissions(self, obj):
        return obj.get_permissions() 
        
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def get_shipping_address_data(self, obj):
        shipping_address = obj.shipping_addresses.first()
        if shipping_address:
            return ShippingAddressSerializer(shipping_address).data
        return None
    def update(self, instance, validated_data):
        shipping_data = validated_data.pop('shipping_address', None)
        instance = super().update(instance, validated_data)

        # Handle shipping address update.
        if shipping_data:
            # Check if user already has a shipping address.
            shipping_address = instance.shippingaddress.first()
            if shipping_address:
                # Update existing shipping address.
                for key, value in shipping_data.items():
                    setattr(shipping_address, key, value)
                shipping_address.save()
            else:
                # Create a new shipping address for the user.
                ShippingAddress.objects.create(user=instance, **shipping_data)
        return instance

class CategorySerializer(ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image_url = serializers.URLField(write_only=True, required=False)
    
    class Meta:
        model = Categories 
        fields = '__all__'
        
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image_url)
        
        return None
    
class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    upload_image_url = serializers.URLField(write_only=True, required=False) 
    category = serializers.PrimaryKeyRelatedField(queryset=Categories.objects.all())
    image = serializers.ImageField(required=False)
    
    class Meta:
        model =Product 
        fields = '__all__'
        
    def create(self, validated_data):
        upload_image_url = validated_data.pop("upload_image_url", None)
        instance = super().create(validated_data)
        
        if upload_image_url:
            response = requests.get(upload_image_url)
            if response.status_code == 200:
                instance.image.save("image.jpg", ContentFile(response.content), save=True)
             
        return instance 
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None 
    
class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    
    class Meta:
        model = OrderItem
        fields = ['id','order', 'product', 'quantity', 'price']      

        
class OrderSerializer(serializers.ModelSerializer):
    # shipping_address_data = serializers.SerializerMethodField(read_only=True)
    shippingAddress = ShippingAddressSerializer()
    items =  OrderItemSerializer(many=True)
    class Meta:
        model = Order 
        fields = ['id','orderId', 'paymentmethod', 'taxPrice', 'shippingAddress', 'totalPrice', 'isPaid', 'paidAt', 'status', 'isDelivered', 'deliveredAt', 'createdAt', 'items']
        extra_kwargs = {"user":{"read_only":True}}
        
    def create(self, validated_data):
        
        shipping_data = validated_data.pop('shippingAddress')
        items_data = validated_data.pop('items')
        
        user = self.context['request'].user
        
        shipping_address = ShippingAddress.objects.create(user=user, **shipping_data)
        order = Order.objects.create(user=user,shippingAddress=shipping_address, **validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        # shipping_address = user.shipping_addresses.first()
        # if shipping_address:
        #     shipping_address.order = order 
        #     shipping_address.save()
        return order
    # def get_shipping_address_data(self, obj):
    #     shipping_address = obj.shippingaddress_set.first()
    #     if shipping_address:
    #         return ShippingAddressSerializer(shipping_address).data
        
    #     user = obj.user
    #     shipping_address = user.shipping_addresses.first()
    #     if shipping_address:
    #         return ShippingAddressSerializer(shipping_address).data
    #     return None
    
class TestimonialsSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    class Meta:
        model = Testimonials
        fields = "__all__"
        
class SliderDataSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image_url = serializers.URLField(write_only=True, required=False)
    class Meta:
        model = SliderData 
        fields = '__all__' 
        
    def create(self, validated_data):
        image_url = validated_data.pop('image_url', None)
        instance = super().create(validated_data)

        if image_url:
            response = requests.get(image_url)
            if response.status_code == 200:
                instance.image.save('image.jpg', ContentFile(response.content), save=True)
        
        return instance
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None
    
class BrandingFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandingFile
        fields = ['file']  
class BrandingRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandingRequest 
        fields = '__all__'
        
class DashboardStatsSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    revenue_change = serializers.FloatField()
    total_orders = serializers.IntegerField()
    orders_change = serializers.FloatField()
    total_products = serializers.IntegerField()
    products_change = serializers.FloatField()
    total_customers = serializers.IntegerField()
    customers_change = serializers.FloatField()

class SalesDataSerializer(serializers.Serializer):
    name = serializers.CharField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)

class CategoryDataSerializer(serializers.Serializer):
    name = serializers.CharField()
    value = serializers.IntegerField()

class RecentOrderSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'orderId', 'user', 'createdAt', 'status', 'totalPrice']
        
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment 
        fields = [
            'id', 'amount', 'currency', 'payment_method', 'status',
            'description', 'reference_number', 'created_at', 'updated_at',
            'completed_at', 'card_last_four', 'card_brand'
        ]
        read_only_fields = [
            'id', 'status', 'reference_number', 'created_at', 
            'updated_at', 'completed_at', 'card_last_four', 'card_brand'
        ]
        
class MPesaPaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1)
    phone_number = serializers.CharField(max_length=15)
    description = serializers.CharField(max_length=255, required=False, default="Payment")
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        # Remove any non-digit characters for validation
        phone = ''.join(filter(str.isdigit, value))
        
        # Check if it's a valid Kenyan phone number
        if len(phone) == 9:  # 7XXXXXXXX
            return value
        elif len(phone) == 10 and phone.startswith('0'):  # 07XXXXXXXX
            return value
        elif len(phone) == 12 and phone.startswith('254'):  # 254XXXXXXXXX
            return value
        elif len(phone) == 13 and phone.startswith('+254'):  # +254XXXXXXXXX
            return value
        else:
            raise serializers.ValidationError("Invalid phone number format")
        
        return value
    
class StripePaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1)
    currency = serializers.CharField(max_length=3, default='usd')
    description = serializers.CharField(max_length=255, required=False, default="Payment")
    customer_email = serializers.EmailField(required=False)
    
    def validate_currency(self, value):
        """Validate currency code"""
        supported_currencies = ['usd', 'kes', 'eur', 'gbp']
        if value.lower() not in supported_currencies:
            raise serializers.ValidationError(
                f"Unsupported currency. Supported: {', '.join(supported_currencies)}"
            )
        return value.lower()

class PaymentStatusSerializer(serializers.ModelSerializer):
    """Serializer for payment status updates"""
    class Meta:
        model = Payment
        fields = ['id', 'status', 'reference_number', 'amount', 'payment_method', 'created_at']
        read_only_fields = ['id', 'reference_number', 'amount', 'payment_method', 'created_at']
        
    
        

    