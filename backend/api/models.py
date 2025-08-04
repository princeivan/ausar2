from django.db import models
import uuid
import random
from django.contrib.auth.models import  AbstractUser
from django_resized import ResizedImageField
from decimal import Decimal
# Create your models here.


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'Regular User')
    ]
    first_name = models.CharField(max_length=500, null=True)
    last_name = models.CharField(max_length=500, null=True)
    email = models.EmailField(unique=True, null=True)
    phone_number = models.CharField(max_length=20, null=False, blank=False) 
    avatar = ResizedImageField(size=[300,300], default='avatar.png')
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def is_admin(self):
        return self.role == 'admin' or self.is_superuser
    
    def get_permissions(self):
        """Return user permissions based on role"""
        if self.is_admin():
            return {
                'can_create_users': True,
                'can_delete_users': True,
                'can_edit_all_users': True,
                'can_view_all_users': True,
                'can_manage_system': True,
                'can_access_admin_panel': True,
            }
        else:  # regular user
            return {
                'can_create_users': False,
                'can_delete_users': False,
                'can_edit_all_users': False,
                'can_view_all_users': False,
                'can_manage_system': False,
                'can_access_admin_panel': False,
            }

 
class Categories(models.Model):
    name = models.CharField(max_length=250)
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)
    
    
    class Meta:
        verbose_name_plural = 'Categories'
        
    def __str__(self):
        return self.name
    
class Product(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='users')
    title = models.CharField(max_length=250)
    image = models.ImageField(null=True, blank=True)
    brand = models.CharField(max_length=200, null=True, blank=True)
    category = models.ForeignKey(Categories, on_delete=models.SET_NULL, null=True, related_name="products")
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    rating = models.IntegerField(null=True, blank=True, default=0)
    numReviews = models.IntegerField(null=True, blank=True, default=0)
    countInStock = models.IntegerField(null=True, blank=True, default=0)
    Date_added = models.DateTimeField(auto_now_add=True)
    new_price = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    old_price = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    specs = models.JSONField(null=True, blank=True)
    best_seller = models.BooleanField(default=False)
    flash_sale = models.BooleanField(default=False)
    flash_sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    flash_sale_end = models.DateTimeField(null=True, blank=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)
    
    def __str__(self):
        return self.title 
    
    class Meta:
        ordering =['-Date_added']
        
    def get_image_url(self):
        return self.image.url if self.image else '/path/to/default/noavatar.png'
        
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="reviews")
    name = models.CharField(max_length=200, null=True, blank=True)
    rating = models.IntegerField(null=True, blank=True, default=0)
    comment=models.TextField(null=True, blank=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)
    
    def __str__(self):
        return str(self.rating)
    
class Testimonials(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL,null=True)
    position = models.CharField(max_length=200, null=True, blank=True)
    rating = models.IntegerField(null=True, blank=True, default=1)
    comment=models.TextField(null=True, blank=True)
    
    def __str__(self):
        return str(self.user)
    
class ShippingAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shipping_addresses')
    town = models.CharField(max_length=200, null=True, blank=True)
    address =models.CharField(max_length=200, null=True, blank=True)
    postalCode = models.IntegerField(null=True, blank=True, default=1)
    country = models.CharField(max_length=200, null=True, blank=True)
    shippingPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)
    
    def __str__(self):
        return f"{self.address }, {self.town}"
    
class Order(models.Model):
    PAYMENT_METHODS = [
        ('mpesa', 'M-Pesa'),
        ('visa', 'Visa/MasterCard')
    ]
    ORDER_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped','Shipped'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded','Refunded')
    ]
    user= models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="orders")
    orderId = models.CharField(max_length=200,null=True, unique=True, blank=True)
    paymentmethod = models.CharField(max_length=200, null=True, blank=True, choices=PAYMENT_METHODS)
    taxPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    shippingPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    totalPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    isPaid = models.BooleanField(default=False)
    paidAt= models.DateTimeField(auto_now_add=False, null=True, blank=True)
    shippingAddress = models.ForeignKey("ShippingAddress", on_delete=models.SET_NULL, null=True, related_name="orders" )
    status = models.CharField(max_length=200, null=True, blank=True, choices=ORDER_STATUS, default='pending')
    isDelivered = models.BooleanField(default=False)
    deliveredAt = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)
    
    
    def save(self, *args, **kwargs):
        if not self.orderId:
            last_order = Order.objects.all().count()+ 1
            self.orderId = f"ORD-{last_order:04d}"
        super().save(*args, **kwargs)
    def __str__(self):
        return str(self.orderId)
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE, null = True)
    product = models.ForeignKey('Product', on_delete=models.CASCADE) 
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)
    def __str__(self):
        return f'{self.product.title} (x{self.quantity}'
    

 
class SliderData(models.Model):
    title = models.CharField(max_length=200, null=True, blank=True)
    image = models.ImageField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)
    
    def __str__(self):
        return self.title
    
class BrandingRequest(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=255, blank=True)
    project_details = models.TextField()
    budget = models.CharField(max_length=100, blank=True)
    timeline = models.CharField(max_length=100, blank=True)
    branding_instructions = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.company}"

class BrandingFile(models.Model):
    branding_request = models.ForeignKey(BrandingRequest, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to='branding_uploads/')
    
    def __str__(self):
        return str(self.branding_request) 
    
    
class Payment(models.Model):
    PAYMENT_METHODS = [
        ('mpesa', 'M-Pesa'),
        ('visa', 'Visa/Mastercard'),
    ]
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Common fields
    description = models.TextField(blank=True, null=True)
    reference_number = models.CharField(max_length=100, unique=True)
    
    # M-Pesa specific fields
    mpesa_phone_number = models.CharField(max_length=15, blank=True, null=True)
    mpesa_checkout_request_id = models.CharField(max_length=100, blank=True, null=True)
    mpesa_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Visa/Card specific fields
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True, null=True)
    card_last_four = models.CharField(max_length=4, blank=True, null=True)
    card_brand = models.CharField(max_length=20, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Webhook/Callback data
    callback_data = models.JSONField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.payment_method.upper()} - {self.amount} {self.currency} - {self.status}"
    
class PaymentWebhook(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='webhooks')
    webhook_type = models.CharField(max_length=50)  # 'mpesa_callback', 'stripe_webhook'
    raw_data = models.JSONField()
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.webhook_type} - {self.payment.reference_number}"
