import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config import settings
from app.models.product import Product
from app.models.customer import Customer
from app.database import Base

async def seed_data():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        # Check if products already exist
        from sqlalchemy import select
        result = await session.execute(select(Product))
        if result.scalars().first():
            print("Database already seeded!")
            return

        print("Seeding dummy products...")
        products = [
            Product(name="Premium Wireless Headphones", sku="AUDIO-WH-01", description="Noise-cancelling over-ear headphones with 30-hour battery life.", price=299.99, stock_quantity=45),
            Product(name="Ergonomic Office Chair", sku="FURN-OC-01", description="Adjustable lumbar support office chair for all-day comfort.", price=199.99, stock_quantity=12),
            Product(name="Mechanical Gaming Keyboard", sku="TECH-KB-01", description="RGB mechanical keyboard with cherry MX switches.", price=129.99, stock_quantity=8),
            Product(name="4K Ultra HD Monitor", sku="TECH-MN-01", description="27-inch 4K IPS monitor with color accuracy.", price=399.99, stock_quantity=22),
            Product(name="Smart Fitness Watch", sku="WEAR-SW-01", description="Water-resistant fitness tracker with heart rate monitor.", price=149.99, stock_quantity=55),
            Product(name="Minimalist Desk Lamp", sku="FURN-LM-01", description="LED desk lamp with adjustable brightness and color temperature.", price=49.99, stock_quantity=5),
            Product(name="Stainless Steel Water Bottle", sku="HOME-WB-01", description="Insulated 32oz water bottle keeps drinks cold for 24 hours.", price=24.99, stock_quantity=150),
            Product(name="Portable Power Bank", sku="TECH-PB-01", description="20000mAh portable charger with fast charging capability.", price=45.99, stock_quantity=80),
        ]
        session.add_all(products)

        print("Seeding dummy customers...")
        customers = [
            Customer(full_name="Alice Johnson", email="alice.j@example.com", phone="555-0101", address="123 Maple Street, NY"),
            Customer(full_name="Bob Smith", email="bob.smith@example.com", phone="555-0102", address="456 Oak Avenue, CA"),
            Customer(full_name="Charlie Davis", email="charlie.d@example.com", phone="555-0103", address="789 Pine Road, TX"),
            Customer(full_name="Diana Evans", email="diana.e@example.com", phone="555-0104", address="321 Elm Street, FL"),
            Customer(full_name="Evan Wright", email="evan.w@example.com", phone="555-0105", address="654 Birch Blvd, WA"),
        ]
        session.add_all(customers)

        await session.commit()
        print("Successfully seeded the database with Products and Customers!")

if __name__ == "__main__":
    asyncio.run(seed_data())
