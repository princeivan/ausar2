from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Try both cookie names
        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE", "access")
        token = request.COOKIES.get(cookie_name) or request.COOKIES.get('access_token')
        
        if not token:
            return None
         
        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except TokenError:
            return None