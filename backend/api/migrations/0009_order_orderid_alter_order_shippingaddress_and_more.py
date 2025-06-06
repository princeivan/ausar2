# Generated by Django 5.1.7 on 2025-05-03 09:37

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_brandingrequest_branding_instructions_brandingfile'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='orderId',
            field=models.CharField(blank=True, max_length=200, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='order',
            name='shippingAddress',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to='api.shippingaddress'),
        ),
        migrations.AlterField(
            model_name='shippingaddress',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shipping_addresses', to=settings.AUTH_USER_MODEL),
        ),
    ]
