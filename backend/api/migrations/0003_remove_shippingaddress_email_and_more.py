# Generated by Django 5.1.7 on 2025-04-12 15:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_user_phone_number'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shippingaddress',
            name='email',
        ),
        migrations.RemoveField(
            model_name='shippingaddress',
            name='fullname',
        ),
        migrations.RemoveField(
            model_name='shippingaddress',
            name='phone',
        ),
        migrations.AddField(
            model_name='shippingaddress',
            name='country',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
