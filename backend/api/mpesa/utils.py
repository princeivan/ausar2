import requests
import base64
import json
from datetime import datetime
from django.conf import settings
from django.utils import timezone
import stripe
import secrets
import string
from .models import Payment, User, Order

class MPesaService:
    def __init__(self):
        self.consumer_key = settings.MPESA_CONFIG['CONSUMER_KEY']
        self.consumer_secret = settings.MPESA_CONFIG['CONSUMER_SECRET']
        self.business_short_code = settings.MPESA_CONFIG['BUSINESS_SHORT_CODE']
        self.pass_key = settings.MPESA_CONFIG['PASS_KEY']
        self.callback_url = settings.MPESA_CONFIG['CALLBACK_URL']
        
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
        
        try:
            response = requests.post(api_url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to initiate M-Pesa payment: {str(e)}")

class StripeService:
    def __init__(self):
        stripe.api_key = settings.STRIPE_CONFIG['SECRET_KEY']
    
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
        """Format phone number for M-Pesa (254XXXXXXXXX)"""
        # Remove any non-digit characters
        phone = ''.join(filter(str.isdigit, phone_number))
        
        # Handle different formats
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        elif phone.startswith('+254'):
            phone = phone[1:]
        elif phone.startswith('254'):
            pass  # Already in correct format
        elif len(phone) == 9:
            phone = '254' + phone
        
        return phone
    
    def create_mpesa_payment(self, user, amount, phone_number, description="Payment"):
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
    
    def create_stripe_payment(self, user, amount, currency='usd', customer_email=None):
        """Create Stripe payment"""
        try:
            # Generate reference number
            reference = self.generate_reference_number()
            
            # Create payment record
            payment = Payment.objects.create(
                user=user,
                amount=amount,
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