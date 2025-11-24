import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from api.models import Product, Categories  
from urllib.parse import urlparse

import json
import uuid
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

# def save_image_from_url(instance, image_url):
#     """Download image from a URL and save it to the ImageField."""
#     response = requests.get(image_url)
#     if response.status_code == 200:
#         file_name = urlparse(image_url).path.split("/")[-1]  # Extract filename
#         instance.image.save(file_name, ContentFile(response.content), save=True)  # Save locally

# class Command(BaseCommand):
#     help = "Fetch all products from an external API and save them to the database"

#     def handle(self, *args, **kwargs):
#         api_urls = [
#             "https://fakestoreapi.com/products/"
#             # "https://fakeapi.net/products"
#         ]
         
#         total_products = 0
#         for base_url in api_urls:
#             page = 1

#         while True:
#             try:
#                 # Fetch products page by page
#                 response = requests.get(f"{base_url}?page={page}&limit=10")
#                 response.raise_for_status()
#                 data = response.json()

#                 products = data if isinstance(data, list) else data.get("data", [])
#                 if not products:
#                     break  # Stop when no more products

#                 for item in products:
#                     # Get or create category
#                     category_obj, _ = Categories.objects.get_or_create(name=item.get("category", "Uncategorized"))

#                     # Create or update product
#                     product, created = Product.objects.update_or_create(
#                         title=item["title"],
#                         defaults={
#                             "new_price": item["price"],
#                             "description": item["description"],
#                             # "brand": item["brand"],
#                             # "countInStock": item["stock"],
#                             "category": category_obj,
#                             "rating": item["rating"]["rate"],
#                             "numReviews": item["rating"]["count"],
#                             # "specs": item.get("specs", {}) 
#                         }
#                     )

#                     # Save image properly
#                     if item.get("image"):
#                         save_image_from_url(product, item["image"])

#                     total_products += 1
#                     if created:
#                         self.stdout.write(self.style.SUCCESS(f'Added: {product.title}'))
#                     else:
#                         self.stdout.write(self.style.WARNING(f'Updated: {product.title}'))

#                 page += 1  # Move to the next page

#             except requests.exceptions.RequestException as e:
#                 self.stderr.write(self.style.ERROR(f"Error fetching products: {e}"))
#                 break  # Stop fetching on error

#         self.stdout.write(self.style.SUCCESS(f'Total products imported: {total_products}'))

# SAMPLE_CATEGORIES = [
#     {"id": "a459c54c-5bc4-4710-9f90-b1085dff33e0", "name": "Electronics"},
#     {"id": "b452578f-1536-4b20-95db-c8803c5dc1c0", "name": "Fashion"},
#     {"id": "1f0a7728-8466-4628-aff5-46c74dabf8cc", "name": "Home & Kitchen"},
#     {"id": "bb7e4b68-9fd9-4022-9fd9-20763d0faee8", "name": "Books"},
#     {"id": "9fcbdf77-5c88-4f4d-8c58-74b91455b898", "name": "Toys"},
# ]

# class Command(BaseCommand):
#     help = "Create sample categories with specific UUIDs"

#     def handle(self, *args, **kwargs):
#         for cat in SAMPLE_CATEGORIES:
#             category, created = Categories.objects.get_or_create(
#                 id=uuid.UUID(cat["id"]),
#                 defaults={"name": cat["name"]}
#             )
#             if created:
#                 self.stdout.write(self.style.SUCCESS(f"Created category: {cat['name']}"))
#             else:
#                 self.stdout.write(f"Category already exists: {cat['name']}")
class Command(BaseCommand):
    help = 'Import products from JSON file'

    def handle(self, *args, **kwargs):
        try:
            with open('products_sample.json', 'r') as file:
                data = json.load(file)

            User = get_user_model()
            default_user = User.objects.first()

            # Map existing categories by UUID
            category_map = {str(cat.id): cat for cat in Categories.objects.all()}

            created_count = 0
            for item in data:
                category_id = item['category']
                if category_id not in category_map:
                    self.stdout.write(self.style.WARNING(f"Category ID {category_id} not found. Skipping..."))
                    continue

                Product.objects.update_or_create(
                    id=uuid.UUID(item['id']),
                    defaults={
                        'user': default_user,
                        'title': item['title'],
                        'image': item['image'],
                        'brand': item['brand'],
                        'category': category_map[category_id],
                        'description': item['description'],
                        'is_active': item['is_active'],
                        'rating': item['rating'],
                        'numReviews': item['numReviews'],
                        'countInStock': item['countInStock'],
                        'Date_added': item['Date_added'],
                        'new_price': item['new_price'],
                        'old_price': item['old_price'],
                        'specs': item['specs'],
                        'best_seller': item['best_seller'],
                        'flash_sale': item['flash_sale'],
                        'flash_sale_price': item['flash_sale_price'],
                        'flash_sale_end': item['flash_sale_end'],
                    }
                )
                created_count += 1

            self.stdout.write(self.style.SUCCESS(f"Successfully imported {created_count} products."))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error importing products: {e}"))
