"""
Seed script: populates the database with realistic dummy data.
Run with: python seed_data/seed.py  (from the backend/ directory)
Or via Django shell: exec(open('seed_data/seed.py').read())
"""
import os
import sys
import django
from pathlib import Path

# Setup Django
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriverify.settings')
django.setup()

from faker import Faker
from django.contrib.auth import get_user_model
from core.models import District, Dealer, AgriProduct, DealerProduct, Report, Review
import random
from datetime import date, timedelta

fake = Faker('en_IN')
User = get_user_model()

STATES = ['Maharashtra', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Karnataka', 'Haryana']
DISTRICTS = {
    'Maharashtra': ['Pune', 'Nashik', 'Aurangabad', 'Nagpur', 'Kolhapur'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
    'Uttar Pradesh': ['Lucknow', 'Agra', 'Kanpur', 'Varanasi', 'Meerut'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur'],
    'Karnataka': ['Bengaluru Rural', 'Mysuru', 'Hubli', 'Belagavi', 'Dharwad'],
    'Haryana': ['Hisar', 'Rohtak', 'Panipat', 'Karnal', 'Faridabad'],
}

PRODUCTS = [
    ('Chlorpyrifos 20 EC', 'Coromandel', 'pesticide'),
    ('Urea 46% N', 'IFFCO', 'fertilizer'),
    ('DAP Fertilizer', 'IFFCO', 'fertilizer'),
    ('Hybrid Maize Seed DKC 9144', 'Dekalb', 'seed'),
    ('Glyphosate 41 SL', 'Bayer', 'herbicide'),
    ('Mancozeb 75 WP', 'UPL', 'fungicide'),
    ('Imidacloprid 17.8 SL', 'Bayer', 'pesticide'),
    ('NPK 19-19-19', 'GSFC', 'fertilizer'),
    ('BT Cotton Seed Bollgard II', 'Mahyco', 'seed'),
    ('Azadirachtin 10000 PPM', 'GreenPathy', 'pesticide'),
    ('Potassium Nitrate', 'SQM', 'fertilizer'),
    ('Trifloxystrobin 25% WG', 'Syngenta', 'fungicide'),
]

CATEGORIES_REPORT = ['fake_product', 'overpricing', 'unlicensed', 'expired_product', 'wrong_advice']


def seed():
    print("🌱 Seeding database...")

    # Admin user
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@agriverify.in', 'admin123', role='admin')
        print("  ✓ Admin user created (admin / admin123)")

    # Districts
    district_objs = []
    for state, dlist in DISTRICTS.items():
        for dname in dlist:
            d, _ = District.objects.get_or_create(name=dname, state=state)
            district_objs.append(d)
    print(f"  ✓ {len(district_objs)} districts")

    # Products
    product_objs = []
    for pname, brand, cat in PRODUCTS:
        p, _ = AgriProduct.objects.get_or_create(
            name=pname,
            defaults={
                'brand': brand,
                'category': cat,
                'description': fake.sentence(),
                'manufacturer': brand,
                'registration_number': f'CIB-{random.randint(10000,99999)}',
                'is_approved': True,
            }
        )
        product_objs.append(p)
    print(f"  ✓ {len(product_objs)} products")

    # Dealers
    dealer_objs = []
    statuses = ['active'] * 7 + ['suspended'] * 2 + ['expired'] * 1
    specialization_pool = ['pesticide', 'fertilizer', 'seed', 'herbicide', 'fungicide']

    for i in range(30):
        district = random.choice(district_objs)
        lic = f"LIC-{district.state[:2].upper()}-{random.randint(10000,99999)}"
        if Dealer.objects.filter(license_number=lic).exists():
            continue
        dealer = Dealer.objects.create(
            name=fake.name(),
            license_number=lic,
            license_status=random.choice(statuses),
            license_expiry=date.today() + timedelta(days=random.randint(-100, 730)),
            shop_name=f"{fake.last_name()} Agro Store",
            address=fake.address(),
            district=district,
            latitude=round(random.uniform(20.0, 30.0), 6),
            longitude=round(random.uniform(74.0, 85.0), 6),
            phone=f"9{random.randint(100000000, 999999999)}",
            email=fake.email(),
            specializations=','.join(random.sample(specialization_pool, random.randint(1, 3))),
        )
        dealer_objs.append(dealer)

        # Assign products
        for prod in random.sample(product_objs, random.randint(2, 6)):
            DealerProduct.objects.get_or_create(dealer=dealer, product=prod, defaults={
                'price': round(random.uniform(50, 2000), 2),
                'in_stock': random.choice([True, True, True, False]),
            })

    print(f"  ✓ {len(dealer_objs)} dealers")

    # Farmer users
    farmer_users = []
    for i in range(10):
        uname = f"farmer{i+1}"
        if not User.objects.filter(username=uname).exists():
            u = User.objects.create_user(uname, f'{uname}@example.com', 'pass1234', role='farmer')
            farmer_users.append(u)
        else:
            farmer_users.append(User.objects.get(username=uname))
    print(f"  ✓ {len(farmer_users)} farmer users")

    # Reports
    report_count = 0
    for _ in range(20):
        dealer = random.choice(dealer_objs)
        reporter = random.choice(farmer_users + [None])
        Report.objects.create(
            reporter=reporter,
            dealer=dealer,
            product=random.choice(product_objs + [None]),
            category=random.choice(CATEGORIES_REPORT),
            description=fake.paragraph(),
            status=random.choice(['pending', 'under_review', 'verified', 'dismissed']),
        )
        report_count += 1
    print(f"  ✓ {report_count} reports")

    # Reviews
    review_count = 0
    for farmer in farmer_users:
        for dealer in random.sample(dealer_objs, min(3, len(dealer_objs))):
            Review.objects.get_or_create(
                reviewer=farmer, dealer=dealer,
                defaults={
                    'rating': random.randint(1, 5),
                    'comment': fake.sentence(),
                }
            )
            review_count += 1

    # Recalculate trust scores
    for dealer in Dealer.objects.all():
        dealer.recalculate_trust_score()

    print(f"  ✓ {review_count} reviews + trust scores updated")
    print("\n✅ Seed complete! Login: admin / admin123")


if __name__ == '__main__':
    seed()
