from database import SessionLocal, Base, engine
from models import Restaurant, MenuItem


Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    restaurants = [
        {
            "name": "Empire Restaurant",
            "description": "South Indian and North Indian food",
            "location": "Bangalore",
            "image_url": "https://example.com/empire.jpg",
        },
        {
            "name": "Pizza Palace",
            "description": "Fresh Italian pizzas",
            "location": "Bangalore",
            "image_url": "https://example.com/pizza.jpg",
        },
        {
            "name": "Burger King",
            "description": "Burgers and fries",
            "location": "Bangalore",
            "image_url": "https://example.com/burger.jpg",
        },
    ]

    restaurant_objects = {}

    for data in restaurants:
        restaurant = (
            db.query(Restaurant)
            .filter(Restaurant.name == data["name"])
            .first()
        )

        if not restaurant:
            restaurant = Restaurant(**data)
            db.add(restaurant)
            db.flush()

        restaurant_objects[data["name"]] = restaurant

    menu_items = [
        {
            "restaurant": "Empire Restaurant",
            "name": "Masala Dosa",
            "description": "Crispy dosa served with sambar and chutney",
            "price": 80.0,
            "image_url": "https://example.com/masala-dosa.jpg",
        },
        {
            "restaurant": "Empire Restaurant",
            "name": "Paneer Butter Masala",
            "description": "Paneer cooked in a rich tomato gravy",
            "price": 180.0,
            "image_url": "https://example.com/paneer.jpg",
        },
        {
            "restaurant": "Pizza Palace",
            "name": "Margherita Pizza",
            "description": "Classic pizza with tomato, mozzarella and basil",
            "price": 250.0,
            "image_url": "https://example.com/margherita.jpg",
        },
        {
            "restaurant": "Pizza Palace",
            "name": "Farmhouse Pizza",
            "description": "Pizza topped with fresh vegetables",
            "price": 320.0,
            "image_url": "https://example.com/farmhouse.jpg",
        },
        {
            "restaurant": "Burger King",
            "name": "Veg Burger",
            "description": "Vegetable patty burger with fresh toppings",
            "price": 150.0,
            "image_url": "https://example.com/veg-burger.jpg",
        },
        {
            "restaurant": "Burger King",
            "name": "French Fries",
            "description": "Crispy golden french fries",
            "price": 100.0,
            "image_url": "https://example.com/fries.jpg",
        },
    ]

    for data in menu_items:
        restaurant = restaurant_objects[data["restaurant"]]

        existing = (
            db.query(MenuItem)
            .filter(
                MenuItem.restaurant_id == restaurant.id,
                MenuItem.name == data["name"],
            )
            .first()
        )

        if not existing:
            menu_item = MenuItem(
                restaurant_id=restaurant.id,
                name=data["name"],
                description=data["description"],
                price=data["price"],
                image_url=data["image_url"],
            )
            db.add(menu_item)

    db.commit()

    print("Database seed completed successfully.")

finally:
    db.close()
