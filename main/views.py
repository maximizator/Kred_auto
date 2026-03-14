from django.shortcuts import render
from .models import Customer, Order, Product, Category, OrderDetail

def index(request):
    context = {}

    # 1. Список объектов по текстовому полю (Клиенты из Франции)
    france_clients = Customer.objects.filter(address__icontains="France")
    context['france_clients'] = france_clients

    # 2. Список объектов по полю даты (Заказы от 08.07.2013)
    target_date = "2013-07-08"
    orders_on_date = Order.objects.filter(order_date=target_date)
    context['orders_on_date'] = orders_on_date

    # 3. Расчет в столбце (Сумма, Среднее, Макс, Мин)
    all_details = OrderDetail.objects.all()
    if all_details:
        quantities = [d.quantity for d in all_details]
        sum_qty = sum(quantities)
        avg_qty = sum_qty / len(quantities)
        max_qty = max(quantities)
        min_qty = min(quantities)
        context['stats'] = {'sum': sum_qty, 'avg': round(avg_qty, 2), 'max': max_qty, 'min': min_qty}
    else:
        context['stats'] = {'sum': 0, 'avg': 0, 'max': 0, 'min': 0}

    # 4. Список объектов по полю почты (Клиенты с gmail)
    gmail_clients = Customer.objects.filter(email__icontains="@gmail.com")
    context['gmail_clients'] = gmail_clients

    # 5. Двойное условие из нескольких таблиц (Электроника И Цена > 5000)
    electronics_category = Category.objects.filter(name="Электроника").first()
    double_condition_products = []
    if electronics_category:
        double_condition_products = Product.objects.filter(category=electronics_category, price__gt=5000)
    context['double_condition_products'] = double_condition_products

    # 6. Расчет в строке по формуле (Количество * Цена)
    details_with_sum = []
    for detail in OrderDetail.objects.all():
        row_sum = detail.quantity * detail.price_at_order
        details_with_sum.append({
            'product_name': detail.product.name,
            'qty': detail.quantity,
            'price': detail.price_at_order,
            'total': row_sum
        })
    context['details_with_calc'] = details_with_sum

    # 7. Запросы с сортировкой (Товары > 1000, сортировка по цене)
    sorted_products = Product.objects.filter(price__gt=1000).order_by('-price')
    context['sorted_products'] = sorted_products

    # 8. Выборка из двух таблиц (Товар + Категория)
    products_with_cat = Product.objects.select_related('category').all()
    context['products_with_cat'] = products_with_cat

    return render(request, 'main/index.html', context)