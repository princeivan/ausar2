from django.db import models
import uuid
import random
from django.contrib.auth.models import  AbstractUser
from django_resized import ResizedImageField
# Create your models here.


class User(AbstractUser):
    first_name = models.CharField(max_length=500, null=True)
    last_name = models.CharField(max_length=500, null=True)
    email = models.EmailField(unique=True, null=True)
    phone_number = models.CharField(max_length=20, null=False, blank=False)
    
    avatar = ResizedImageField(size=[300,300], default='avatar.png')
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
class Categories(models.Model):
    name = models.CharField(max_length=250)
    id = models.UUIDField(default=uuid.uuid4, unique=True,
                          primary_key=True, editable=False)
    
    def __str__(self):
        return self.name
    
class Product(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='users')
    title = models.CharField(max_length=250)
    image = models.ImageField(null=True, blank=True)
    brand = models.CharField(max_length=200, null=True, blank=True)
    category = models.ForeignKey(Categories, on_delete=models.SET_NULL, null=True, related_name="categories")
    description = models.TextField(null=True, blank=True)
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
    user= models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="orders")
    orderId = models.CharField(max_length=200,null=True, unique=True, blank=True)
    paymentmethod = models.CharField(max_length=200, null=True, blank=True)
    taxPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    shippingPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    totalPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    isPaid = models.BooleanField(default=False)
    paidAt= models.DateTimeField(auto_now_add=False, null=True, blank=True)
    shippingAddress = models.ForeignKey("ShippingAddress", on_delete=models.SET_NULL, null=True, related_name="orders" )
    status = models.CharField(max_length=200, null=True, blank=True)
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
