#!/usr/bin/env python3
"""
generate_products.py

Generates ~120 random products with believable Chilean Peso prices
and POSTs them to the Spring Boot backend at http://localhost:3770/api/v1/products

Usage:
    python generate_products.py
    python generate_products.py --count 120 --dry-run
"""

import argparse
import json
import random
import sys
import time
from datetime import date, timedelta

import requests

BACKEND_URL = "http://localhost:3770/api/v1/products"

PRODUCT_TYPES = [
    "FOOD", "APPLIANCES", "LIQUIDS",
    "ALCOHOLIC_BEVERAGES", "BEVERAGES",
    "ELECTRONICS", "OTHER"
]

# Believable CLP price ranges per product type
PRICE_RANGES = {
    "FOOD":                 (1_500, 25_000),
    "APPLIANCES":           (45_000, 850_000),
    "LIQUIDS":              (1_000, 8_000),
    "ALCOHOLIC_BEVERAGES":  (5_000, 120_000),
    "BEVERAGES":            (800, 5_000),
    "ELECTRONICS":          (25_000, 1_500_000),
    "OTHER":                (2_000, 80_000),
}

# Name templates per type
NAME_TEMPLATES = {
    "FOOD": [
        "Organic {adj} {item}", "Artisan {item} Pack", "Premium {adj} {item}",
        "Traditional {item}", "Gourmet {item} Box"
    ],
    "APPLIANCES": [
        "{brand} {item} Pro", "{brand} {item} Series {n}",
        "{brand} Smart {item}", "{item} {brand} Edition"
    ],
    "LIQUIDS": [
        "Pure {item} {size}ml", "Natural {adj} {item}",
        "{brand} {item} {size}ml", "Sparkling {item}"
    ],
    "ALCOHOLIC_BEVERAGES": [
        "{brand} Reserva {item}", "Premium {item} {n} años",
        "{item} {brand} Especial", "Cosecha {item} {brand}"
    ],
    "BEVERAGES": [
        "{brand} {item} {size}ml", "Light {item} {brand}",
        "{item} Zero {brand}", "Natural {item} {size}ml"
    ],
    "ELECTRONICS": [
        "{brand} {item} {n}GB", "{brand} {item} Pro Max",
        "{item} {brand} Ultra", "{brand} {item} {n} Edition"
    ],
    "OTHER": [
        "{adj} {item} Set", "Deluxe {item}", "{brand} {item} Pack",
        "Essential {item} Kit"
    ],
}

ADJECTIVES = ["Fresh", "Classic", "Royal", "Golden", "Silver", "Vintage", "Deluxe"]
ITEMS = {
    "FOOD": ["Quinoa", "Salmon", "Avocado", "Wine Pairing Snack", "Chocolate", "Cheese"],
    "APPLIANCES": ["Blender", "Coffee Maker", "Vacuum", "Air Fryer", "Toaster", "Mixer"],
    "LIQUIDS": ["Water", "Juice", "Mineral Water", "Soda", "Tonic"],
    "ALCOHOLIC_BEVERAGES": ["Cabernet", "Pisco", "Carmenere", "Sauvignon", "Chardonnay"],
    "BEVERAGES": ["Cola", "Energy Drink", "Tea", "Kombucha", "Lemonade"],
    "ELECTRONICS": ["Headphones", "Smartwatch", "Tablet", "Speaker", "Keyboard", "Mouse"],
    "OTHER": ["Notebook", "Backpack", "Umbrella", "Candle", "Plant Pot"],
}
BRANDS = ["Austral", "Andes", "Patagonia", "Cóndor", "Volcán", "Mapocho", "Valparaíso"]


def generate_product(i: int) -> dict:
    ptype = random.choice(PRODUCT_TYPES)
    lo, hi = PRICE_RANGES[ptype]
    price = random.randint(lo // 1000, hi // 1000) * 1000  # round to nearest 1000 CLP

    template = random.choice(NAME_TEMPLATES[ptype])
    item = random.choice(ITEMS[ptype])
    name = template.format(
        adj=random.choice(ADJECTIVES),
        item=item,
        brand=random.choice(BRANDS),
        n=random.randint(1, 9),
        size=random.choice([250, 330, 500, 750, 1000])
    )

    # Manufacturing date within last 2 years
    mfg_date = date.today() - timedelta(days=random.randint(30, 730))

    return {
        "productName": name,
        "productPrice": price,
        "productStock": random.randint(0, 500),
        "manufacturer": random.choice(BRANDS) + " Industries",
        "manufacturingDate": mfg_date.isoformat(),
        "type": ptype,
    }


def main():
    parser = argparse.ArgumentParser(description="Seed the DinoBox backend with random products")
    parser.add_argument("--count", type=int, default=120, help="Number of products to generate")
    parser.add_argument("--dry-run", action="store_true", help="Print JSON without POSTing")
    parser.add_argument("--url", default=BACKEND_URL, help="Backend products endpoint")
    args = parser.parse_args()

    products = [generate_product(i) for i in range(args.count)]

    if args.dry_run:
        print(json.dumps(products, indent=2))
        print(f"\n# Generated {len(products)} products (dry run)", file=sys.stderr)
        return

    print(f"Seeding {len(products)} products to {args.url} ...")
    success, failed = 0, 0
    for i, p in enumerate(products, 1):
        try:
            r = requests.post(args.url, json=p, timeout=10)
            if r.status_code in (200, 201):
                success += 1
                if i % 20 == 0:
                    print(f"  [{i}/{len(products)}] ✓")
            else:
                failed += 1
                print(f"  ✗ {p['productName']}: HTTP {r.status_code} - {r.text[:100]}", file=sys.stderr)
        except requests.RequestException as e:
            failed += 1
            print(f"  ✗ {p['productName']}: {e}", file=sys.stderr)
            if failed > 5:
                print("Too many failures, aborting.", file=sys.stderr)
                sys.exit(1)
        time.sleep(0.05)  # be nice to the backend

    print(f"\nDone: {success} created, {failed} failed.")


if __name__ == "__main__":
    main()