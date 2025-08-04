import requests
import base64
import json
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
import stripe
import secrets
import string
from .models import Payment, User, Order, Categories, Product
from django.db.models import Sum, Count, Q, F
from collections import defaultdict
import calendar

class MPesaService:
    def __init__(self):
        self.consumer_key = settings.MPESA_CONFIG['MPESA_CONSUMER_KEY']
        self.consumer_secret = settings.MPESA_CONFIG['MPESA_CONSUMER_SECRET']
        self.business_short_code = settings.MPESA_CONFIG['MPESA_SHORTCODE']
        self.pass_key = settings.MPESA_CONFIG['MPESA_PASSKEY']
        self.callback_url = settings.MPESA_CONFIG['MPESA_CALLBACK_URL']
        
        if settings.MPESA_CONFIG['ENVIRONMENT'] == 'sandbox':
            self.base_url = settings.MPESA_CONFIG['SANDBOX_URL']
        else:
            self.base_url = settings.MPESA_CONFIG['PRODUCTION_URL']
    
    def get_access_token(self):
        """Get OAuth access token from Safaricom API"""
        api_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        
        # Create basic auth header
        auth_string = f"{self.consumer_key}:{self.consumer_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(api_url, headers=headers)
            response.raise_for_status()
            return response.json()['access_token']
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get M-Pesa access token: {str(e)}")
    
    def generate_password(self):
        """Generate password for M-Pesa API"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_string = f"{self.business_short_code}{self.pass_key}{timestamp}"
        password = base64.b64encode(password_string.encode()).decode('utf-8')
        return password, timestamp
    
    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """Initiate STK Push for M-Pesa payment"""
        access_token = self.get_access_token()
        password, timestamp = self.generate_password()
        
        api_url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'BusinessShortCode': self.business_short_code,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(float(amount)),
            'PartyA': phone_number,
            'PartyB': self.business_short_code,
            'PhoneNumber': phone_number,
            'CallBackURL': self.callback_url,
            'AccountReference': account_reference,
            'TransactionDesc': transaction_desc
        }
        print("M-Pesa Payload:", payload)
       
        try:
            response = requests.post(api_url, json=payload, headers=headers)
            print("Safaricom Response:", response.status_code, response.text)
            response.raise_for_status()
            return response.json()
           
        except requests.exceptions.HTTPError as e:
            print("HTTPError:", e.response.status_code, e.response.text)
            raise Exception(f"Safaricom Error: {e.response.text}")

class StripeService:
    def __init__(self):
        stripe.api_key = settings.STRIPE_CONFIG['STRIPE_SECRET_KEY']
    
    def create_payment_intent(self, amount, currency='usd', customer_email=None):
        """Create a Stripe Payment Intent"""
        try:
            # Convert amount to cents for Stripe
            amount_cents = int(float(amount) * 100)
            
            intent_data = {
                'amount': amount_cents,
                'currency': currency,
                'automatic_payment_methods': {
                    'enabled': True,
                },
            }
            
            if customer_email:
                intent_data['receipt_email'] = customer_email
            
            intent = stripe.PaymentIntent.create(**intent_data)
            return intent
            
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create Stripe payment intent: {str(e)}")
    
    def confirm_payment_intent(self, payment_intent_id):
        """Confirm a payment intent and get its status"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve payment intent: {str(e)}")

class PaymentService:
    def __init__(self):
        self.mpesa_service = MPesaService()
        self.stripe_service = StripeService()
    
    def generate_reference_number(self):
        """Generate unique reference number"""
        prefix = "PAY"
        random_string = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        timestamp = datetime.now().strftime('%Y%m%d')
        return f"{prefix}{timestamp}{random_string}"
    
    def format_phone_number(self, phone_number):
        phone = ''.join(filter(str.isdigit, phone_number))
        
        if phone.startswith('0'):
            return '254' + phone[1:]
        elif phone.startswith('254') and len(phone) == 12:
            return phone
        elif phone.startswith('7') and len(phone) == 9:
            return '254' + phone
        elif phone.startswith('1') and len(phone) == 9:
            return '254' + phone
        else:
            raise ValueError("Invalid phone number format")
        
        
    def create_order_payment(self, order_id, payment_method, phone_number=None):
        order = Order.objects.get(orderId=order_id)

        if payment_method == "mpesa":
            return self.create_mpesa_payment(
                user=order.user,
                amount=order.totalPrice,
                phone_number=phone_number,
                description=f"Payment for order {order.orderId}",
                order=order
            )
        elif payment_method == "visa":
            return self.create_stripe_payment(
                user=order.user,
                amount=order.totalPrice,
                customer_email=order.user.email if order.user else None,
                order=order
            )
        else:
            return {"success": False, "message": "Unsupported payment method."}
        
    def create_mpesa_payment(self, user, order, amount, phone_number, description="Payment"):
        """Create M-Pesa payment"""
        try:
            # Format phone number
            formatted_phone = self.format_phone_number(phone_number)
            
            # Generate reference number
            reference = self.generate_reference_number()
            
            # Create payment record
            payment = Payment.objects.create(
                user=user,
                amount=amount,
                order=order,
                payment_method='mpesa',
                status='pending',
                description=description,
                reference_number=reference,
                mpesa_phone_number=formatted_phone
            )
            
            # Initiate STK push
            mpesa_response = self.mpesa_service.initiate_stk_push(
                phone_number=formatted_phone,
                amount=amount,
                account_reference=reference,
                transaction_desc=description
            )
            
            # Update payment with M-Pesa response
            if mpesa_response.get('ResponseCode') == '0':
                payment.mpesa_checkout_request_id = mpesa_response.get('CheckoutRequestID')
                payment.status = 'processing'
                payment.save()
                
                return {
                    'success': True,
                    'payment_id': str(payment.id),
                    'reference': reference,
                    'checkout_request_id': mpesa_response.get('CheckoutRequestID'),
                    'message': 'Payment initiated. Please complete on your phone.'
                }
            else:
                payment.status = 'failed'
                payment.callback_data = mpesa_response
                payment.save()
                
                return {
                    'success': False,
                    'message': mpesa_response.get('errorMessage', 'Payment initiation failed')
                }
                
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }
    
    def create_stripe_payment(self, user, amount,order, currency='usd', customer_email=None):
        """Create Stripe payment"""
        try:
            # Generate reference number
            reference = self.generate_reference_number()
            
            # Create payment record
            payment = Payment.objects.create(
                user=user,
                amount=amount,
                order=order,
                currency=currency.upper(),
                payment_method='visa',
                status='pending',
                reference_number=reference
            )
            
            # Create Stripe payment intent
            intent = self.stripe_service.create_payment_intent(
                amount=amount,
                currency=currency,
                customer_email=customer_email
            )
            
            # Update payment with Stripe data
            payment.stripe_payment_intent_id = intent.id
            payment.save()
            
            return {
                'success': True,
                'payment_id': str(payment.id),
                'reference': reference,
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }
    
    def process_mpesa_callback(self, callback_data):
        """Process M-Pesa callback data"""
        try:
            checkout_request_id = callback_data.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID')
            
            if not checkout_request_id:
                return False
            
            # Find payment by checkout request ID
            payment = Payment.objects.filter(
                mpesa_checkout_request_id=checkout_request_id
            ).first()
            
            if not payment:
                return False
            
            # Update payment based on callback
            stk_callback = callback_data.get('Body', {}).get('stkCallback', {})
            result_code = stk_callback.get('ResultCode')
            
            if result_code == 0:
                # Payment successful
                callback_metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                
                # Extract transaction ID
                for item in callback_metadata:
                    if item.get('Name') == 'MpesaReceiptNumber':
                        payment.mpesa_transaction_id = item.get('Value')
                        break
                
                payment.status = 'completed'
                payment.completed_at = timezone.now()
            else:
                # Payment failed
                payment.status = 'failed'
            
            payment.callback_data = callback_data
            payment.save()
            
            return True
            
        except Exception as e:
            print(f"Error processing M-Pesa callback: {str(e)}")
            return False
    
    def process_stripe_webhook(self, webhook_data, payment_intent_id):
        """Process Stripe webhook data"""
        try:
            payment = Payment.objects.filter(
                stripe_payment_intent_id=payment_intent_id
            ).first()
            
            if not payment:
                return False
            
            event_type = webhook_data.get('type')
            
            if event_type == 'payment_intent.succeeded':
                payment_intent = webhook_data.get('data', {}).get('object', {})
                
                if float(payment.amount) != float(payment_intent['amount']) / 100:
                    print("Amount mismatch")
                    return False
                # Extract card details if available
                charges = payment_intent.get('charges', {}).get('data', [])
                if charges:
                    charge = charges[0]
                    payment_method = charge.get('payment_method_details', {}).get('card', {})
                    payment.card_last_four = payment_method.get('last4')
                    payment.card_brand = payment_method.get('brand')
                
                payment.status = 'completed'
                payment.completed_at = timezone.now()
                
            elif event_type == 'payment_intent.payment_failed':
                payment.status = 'failed'
            
            payment.callback_data = webhook_data
            payment.save()
            
            return True
            
        except Exception as e:
            print(f"Error processing Stripe webhook: {str(e)}")
            return False
        
class DashboardAnalyticsService:

    @staticmethod
    def get_date_range(period='month'):
        """Get date range for comparison"""
        now = timezone.now()

        if period == 'month':
            current_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            previous_start = (current_start - timedelta(days=1)).replace(day=1)
            previous_end = current_start - timedelta(seconds=1)
        elif period == 'week':
            current_start = now - timedelta(days=now.weekday())
            current_start = current_start.replace(hour=0, minute=0, second=0, microsecond=0)
            previous_start = current_start - timedelta(days=7)
            previous_end = current_start - timedelta(seconds=1)
        else:  # day
            current_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            previous_start = current_start - timedelta(days=1)
            previous_end = current_start - timedelta(seconds=1)

        return current_start, previous_start, previous_end, now

    @staticmethod
    def calculate_percentage_change(current, previous):
        """Calculate percentage change between two values"""
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return ((current - previous) / previous) * 100

    @staticmethod
    def get_dashboard_stats():
        """Get main dashboard statistics"""
        current_start, previous_start, previous_end, now = DashboardAnalyticsService.get_date_range('month')

        # Current month stats
        current_revenue = Order.objects.filter(
            createdAt__gte=current_start,
            createdAt__lte=now,
            isPaid = True
        ).aggregate(total=Sum('totalPrice'))['total'] or 0

        current_orders = Order.objects.filter(
            createdAt__gte=current_start,
            createdAt__lte=now
        ).count()

        current_customers = User.objects.filter(
            date_joined__gte=current_start,
            date_joined__lte=now,
            role='user'
        ).count()

        # Previous month stats
        previous_revenue = Order.objects.filter(
            createdAt__gte=previous_start,
            createdAt__lte=previous_end,
            isPaid = True
        ).aggregate(total=Sum('totalPrice'))['total'] or 0

        previous_orders = Order.objects.filter(
            createdAt__gte=previous_start,
            createdAt__lte=previous_end
        ).count()

        previous_customers = User.objects.filter(
            date_joined__gte=previous_start,
            date_joined__lte=previous_end,
            role='user'
        ).count()

        # Total products
        total_products = Product.objects.filter(is_active=True).count()
        total_customers_all = User.objects.filter(role='user').count()

        # Calculate changes
        revenue_change = DashboardAnalyticsService.calculate_percentage_change(
            float(current_revenue), float(previous_revenue)
        )
        orders_change = DashboardAnalyticsService.calculate_percentage_change(
            current_orders, previous_orders
        )
        customers_change = DashboardAnalyticsService.calculate_percentage_change(
            current_customers, previous_customers
        )

        return {
            'total_revenue': current_revenue,
            'revenue_change': revenue_change,
            'total_orders': current_orders,
            'orders_change': orders_change,
            'total_products': total_products,
            'products_change': 0,  # You can implement product change tracking
            'total_customers': total_customers_all,
            'customers_change': customers_change,
        }

    @staticmethod
    def get_sales_data(months=7):
        """Get sales data for the last N months"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=months * 30)

        # Get orders grouped by month
        orders = Order.objects.filter(
            createdAt__gte=start_date,
            createdAt__lte=end_date,
            status__in=['delivered', 'shipped', 'processing']
        ).values(
            'createdAt__year',
            'createdAt__month'
        ).annotate(
            total=Sum('totalPrice')
        ).order_by('createdAt__year', 'createdAt__month')

        # Create a dictionary for easy lookup
        sales_dict = {}
        for order in orders:
            year = order['createdAt__year']
            month = order['createdAt__month']
            key = f"{year}-{month:02d}"
            sales_dict[key] = float(order['total'])

        # Generate data for the last N months
        sales_data = []
        current_date = end_date

        for i in range(months):
            month_date = current_date - timedelta(days=i * 30)
            month_key = f"{month_date.year}-{month_date.month:02d}"
            month_name = calendar.month_abbr[month_date.month]

            sales_data.insert(0, {
                'name': month_name,
                'total': sales_dict.get(month_key, 0)
            })

        return sales_data

    @staticmethod
    def get_category_data():
        """Get product category distribution"""
        categories = Categories.objects.annotate(
            product_count=Count('products', filter=Q(products__is_active=True))
        ).values('name', 'product_count')

        total_products = sum(cat['product_count'] for cat in categories)

        category_data = []
        for category in categories:
            if category['product_count'] > 0:
                percentage = (category['product_count'] / total_products) * 100
                category_data.append({
                    'name': category['name'],
                    'value': round(percentage)
                })

        return category_data

    @staticmethod
    def get_recent_orders(limit=5):
        """Get recent orders"""
        return Order.objects.select_related('user').order_by('-createdAt')[:limit]