# Generated by Django 5.1.7 on 2025-05-01 16:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_testimonials'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shippingaddress',
            name='postalCode',
            field=models.IntegerField(blank=True, default=1, null=True),
        ),
    ]
