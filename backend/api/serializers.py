from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from  .models import Categories, Product, Order, OrderItem, ShippingAddress, SliderData,User 
import requests
from django.core.files.base import ContentFile

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
    class Meta:
        model = User 
        fields = ["id", "username","first_name","last_name","email","phone_number","password", "confirm_password"]
        extra_kwargs = {"password":{"write_only":True}}
        
        
    def validate(self, data):
            if data['password'] != data['confirm_password']:
                raise serializers.ValidationError({"password":"Password do not match"})
            return data
        
    def create(self, validated_data):
            validated_data.pop("confirm_password")
            user = User.objects.create_user(**validated_data)
            return user
        
class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = ['town', 'address','postalcode','country','shippingPrice']
        
class UserProfileSerializer(serializers.ModelSerializer):
    shipping_address = ShippingAddressSerializer(required=False)
    shipping_address_data = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User 
        fields = ["id", "username", "first_name", "last_name", 
                 "email", "phone_number","shipping_address","shipping_address_data"]
        read_only_fields = ["email","username"]   
    
    def get_shipping_address_data(self, obj):
        shipping_address = obj.shippingaddress_set.first()
        if shipping_address:
            return ShippingAddressSerializer(shipping_address).data
        return None
    def update(self, instance, validated_data):
        # Remove nested shipping address data if present.
        shipping_data = validated_data.pop('shipping_address', None)
        # Update user instance normally.
        instance = super().update(instance, validated_data)

        # Handle shipping address update.
        if shipping_data:
            # Check if user already has a shipping address.
            shipping_address = instance.shippingaddress_set.first()
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
    image_url = serializers.URLField(write_only=True, required=False)
    category= CategorySerializer()
    
    class Meta:
        model =Product 
        fields = '__all__'
        
    def create(self, validated_data):
        image_url = validated_data.pop("image_url", None)
        instance = super().create(validated_data)
        
        if image_url:
            response = requests.get(image_url)
            if response.status_code == 200:
                instance.image.save("image.jpg", ContentFile(response.content), save=True)
             
        return instance 
    
    def get_image_url(self, obj):
        request = self.Context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None 
    
class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    
    class Meta:
        model = OrderItem
        fields = ['id','order', 'product', 'quantity', 'price']      

        
class OrderSerializer(serializers.ModelSerializer):
    
    items =  OrderItemSerializer(many=True)
    class Meta:
        model = Order 
        fields = ['id', 'paymentmethod', 'taxPrice', 'shippingPrice', 'totalPrice', 'isPaid', 'paidAt', 'status', 'isDelivered', 'deleveredAt', 'createdAt', 'items']
        extra_kwargs = {"user":{"read-only":True}}
        
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order

        
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
    
        

    