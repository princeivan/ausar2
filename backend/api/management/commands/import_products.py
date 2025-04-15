import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from api.models import Product, Categories  
from urllib.parse import urlparse  

def save_image_from_url(instance, image_url):
    """Download image from a URL and save it to the ImageField."""
    response = requests.get(image_url)
    if response.status_code == 200:
        file_name = urlparse(image_url).path.split("/")[-1]  # Extract filename
        instance.image.save(file_name, ContentFile(response.content), save=True)  # Save locally

class Command(BaseCommand):
    help = "Fetch all products from an external API and save them to the database"

    def handle(self, *args, **kwargs):
        api_urls = [
            "https://fakestoreapi.com/products/"
            # "https://fakeapi.net/products"
        ]
         
        total_products = 0
        for base_url in api_urls:
            page = 1

        while True:
            try:
                # Fetch products page by page
                response = requests.get(f"{base_url}?page={page}&limit=10")
                response.raise_for_status()
                data = response.json()

                products = data if isinstance(data, list) else data.get("data", [])
                if not products:
                    break  # Stop when no more products

                for item in products:
                    # Get or create category
                    category_obj, _ = Categories.objects.get_or_create(name=item.get("category", "Uncategorized"))

                    # Create or update product
                    product, created = Product.objects.update_or_create(
                        title=item["title"],
                        defaults={
                            "new_price": item["price"],
                            "description": item["description"],
                            # "brand": item["brand"],
                            # "countInStock": item["stock"],
                            "category": category_obj,
                            "rating": item["rating"]["rate"],
                            "numReviews": item["rating"]["count"],
                            # "specs": item.get("specs", {}) 
                        }
                    )

                    # Save image properly
                    if item.get("image"):
                        save_image_from_url(product, item["image"])

                    total_products += 1
                    if created:
                        self.stdout.write(self.style.SUCCESS(f'Added: {product.title}'))
                    else:
                        self.stdout.write(self.style.WARNING(f'Updated: {product.title}'))

                page += 1  # Move to the next page

            except requests.exceptions.RequestException as e:
                self.stderr.write(self.style.ERROR(f"Error fetching products: {e}"))
                break  # Stop fetching on error

        self.stdout.write(self.style.SUCCESS(f'Total products imported: {total_products}'))
