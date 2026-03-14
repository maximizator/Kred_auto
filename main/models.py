from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=50)

class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.FloatField()
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    
    # Обязательные типы полей из задания
    date_field = models.DateField(null=True, blank=True)
    time_field = models.TimeField(null=True, blank=True)
    datetime_field = models.DateTimeField(null=True, blank=True)
    email_field = models.EmailField(blank=True)
    url_field = models.URLField(blank=True)
    file_field = models.FileField(upload_to='files/', blank=True, null=True)
    image_field = models.ImageField(upload_to='images/', blank=True, null=True)

class Customer(models.Model):
    code = models.CharField(max_length=3)
    fio = models.CharField(max_length=20)
    address = models.CharField(max_length=30)
    phone = models.CharField(max_length=15)
    postal_code = models.CharField(max_length=10)
    email = models.EmailField(blank=True)

class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    order_date = models.DateField()

class OrderDetail(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price_at_order = models.FloatField()