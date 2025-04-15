import requests
from celery import shared_task
from django.contrib.auth.models import User
from api.models import Product, Categories 

API_URL = "https://fakeapi.net/products"

@shared_task
def import_products():
    try:
        
        response = requests.get(API_URL)
        
        if response.status_code == 200:
            data = response.json().get("data", [])
            
            for item in data:
                category_name = item.get("category", "uncategorized")
                category, _ = Categories.objects.get_or_create(name=category_name)
                
                user = User.objects.first()
                
                rating_info = item.get("rating", {})
                rating_value = rating_info.get("rate",0)
                num_reviews = rating_info.get("count", 0)
                
                
                product, created = Product.objects.update_or_create(
                    title=item['title'],
                    defaults= {
                        "user":user,
                        "description": item.get("description"),
                        "image": item.get("image"),
                        "category": category,
                        'brand':item.get('brand'),
                        "countInStock": item.get('stock', 0),
                        "rating": rating_value,
                        "numReviews": num_reviews,
                        "new_price":item.get('price')
                    }
                )
                if created:
                    print(f"added:{product.name}")
                else:
                    print(f"updated:{product.name}")
                    
        else:
            print(f"Failed to fetch products:{response.status_code}")
    
    except Exception as e:
        print(f"Error importing products: {str(e)}")