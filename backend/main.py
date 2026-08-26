from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import (
    Restaurant,
    MenuItem,
    Cart,
    CartItem,
    Order,
    OrderItem,
)
from schemas import (
    RestaurantCreate,
    RestaurantResponse,
    MenuItemCreate,
    MenuItemResponse,
    CartItemCreate,
    CartItemResponse,
)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Food Ordering Platform API is running"}


@app.get("/restaurants/", response_model=list[RestaurantResponse])
def get_restaurants(db: Session = Depends(get_db)):
    restaurants = db.query(Restaurant).filter(
        Restaurant.is_active == True
    ).all()

    return restaurants


@app.post("/restaurants/", response_model=RestaurantResponse)
def create_restaurant(
    restaurant: RestaurantCreate,
    db: Session = Depends(get_db)
):
    new_restaurant = Restaurant(
        name=restaurant.name,
        description=restaurant.description,
        location=restaurant.location,
        image_url=restaurant.image_url,
    )

    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)

    return new_restaurant

@app.post("/menu-items/", response_model=MenuItemResponse)
def create_menu_item(
    menu_item: MenuItemCreate,
    db: Session = Depends(get_db)
):
    new_menu_item = MenuItem(
        restaurant_id=menu_item.restaurant_id,
        name=menu_item.name,
        description=menu_item.description,
        price=menu_item.price,
        image_url=menu_item.image_url,
    )

    db.add(new_menu_item)
    db.commit()
    db.refresh(new_menu_item)

    return new_menu_item

@app.get(
    "/restaurants/{restaurant_id}/menu-items/",
    response_model=list[MenuItemResponse]
)
def get_menu_items(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    menu_items = db.query(MenuItem).filter(
        MenuItem.restaurant_id == restaurant_id,
        MenuItem.is_available == True
    ).all()

    return menu_items

@app.post("/carts/")
def create_cart(db: Session = Depends(get_db)):
    cart = Cart()

    db.add(cart)
    db.commit()
    db.refresh(cart)

    return {
        "id": cart.id,
        "message": "Cart created successfully"
    }

@app.post("/carts/{cart_id}/items/")
def add_to_cart(
    cart_id: int,
    cart_item: CartItemCreate,
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(
        Cart.id == cart_id
    ).first()

    if not cart:
        return {"error": "Cart not found"}

    menu_item = db.query(MenuItem).filter(
        MenuItem.id == cart_item.menu_item_id,
        MenuItem.is_available == True
    ).first()

    if not menu_item:
        return {"error": "Menu item not found"}

    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart_id,
        CartItem.menu_item_id == cart_item.menu_item_id
    ).first()

    if existing_item:
        existing_item.quantity += cart_item.quantity
        db.commit()
        db.refresh(existing_item)

        return existing_item

    new_item = CartItem(
        cart_id=cart_id,
        menu_item_id=cart_item.menu_item_id,
        quantity=cart_item.quantity
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item

@app.get("/carts/{cart_id}")
def get_cart(
    cart_id: int,
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(
        Cart.id == cart_id
    ).first()

    if not cart:
        return {"error": "Cart not found"}

    items = []

    total = 0

    for item in cart.items:
        item_total = item.menu_item.price * item.quantity
        total += item_total

        items.append({
            "id": item.id,
            "menu_item_id": item.menu_item_id,
            "name": item.menu_item.name,
            "price": item.menu_item.price,
            "quantity": item.quantity,
            "item_total": item_total
        })

    return {
        "cart_id": cart.id,
        "items": items,
        "total": total
    }

@app.put("/carts/{cart_id}/items/{cart_item_id}")
def update_cart_item(
    cart_id: int,
    cart_item_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.cart_id == cart_id
    ).first()

    if not cart_item:
        return {"error": "Cart item not found"}

    if quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = quantity

    db.commit()

    return {
        "message": "Cart updated successfully"
    }

@app.delete("/carts/{cart_id}/items/{cart_item_id}")
def remove_cart_item(
    cart_id: int,
    cart_item_id: int,
    db: Session = Depends(get_db)
):
    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.cart_id == cart_id
    ).first()

    if not cart_item:
        return {"error": "Cart item not found"}

    db.delete(cart_item)
    db.commit()

    return {
        "message": "Item removed from cart"
    }

@app.post("/carts/{cart_id}/checkout/")
def checkout(
    cart_id: int,
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(
        Cart.id == cart_id
    ).first()

    if not cart:
        return {"error": "Cart not found"}

    if not cart.items:
        return {"error": "Cart is empty"}

    total = 0

    order = Order(
        cart_id=cart_id,
        total_amount=0,
        status="placed"
    )

    db.add(order)
    db.flush()

    for cart_item in cart.items:

        price = cart_item.menu_item.price

        item_total = price * cart_item.quantity

        total += item_total

        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=cart_item.menu_item_id,
            quantity=cart_item.quantity,
            price=price
        )

        db.add(order_item)

    order.total_amount = total

    db.commit()
    db.refresh(order)

    return {
        "message": "Order placed successfully",
        "order_id": order.id,
        "total_amount": order.total_amount,
        "status": order.status
    }

@app.get("/orders/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        return {"error": "Order not found"}

    items = []

    for item in order.items:
        item_total = item.price * item.quantity

        items.append({
            "id": item.id,
            "menu_item_id": item.menu_item_id,
            "name": item.menu_item.name,
            "price": item.price,
            "quantity": item.quantity,
            "item_total": item_total
        })

    return {
        "order_id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "created_at": order.created_at,
        "items": items
    }

@app.get("/orders/")
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(
        Order.created_at.desc()
    ).all()

    result = []

    for order in orders:
        items = []

        for item in order.items:
            items.append({
                "id": item.id,
                "menu_item_id": item.menu_item_id,
                "name": item.menu_item.name,
                "price": item.price,
                "quantity": item.quantity,
                "item_total": item.price * item.quantity
            })

        result.append({
            "order_id": order.id,
            "status": order.status,
            "total_amount": order.total_amount,
            "created_at": order.created_at,
            "items": items
        })

    return result

# =========================================================
# UPDATE ORDER STATUS
# =========================================================

@app.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    # Find the order using the order ID
    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    # Return an error if the order doesn't exist
    if not order:
        return {
            "error": "Order not found"
        }

    # Allowed order statuses
    allowed_statuses = [
        "placed",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered"
    ]

    # Validate the requested status
    if status not in allowed_statuses:
        return {
            "error": "Invalid order status",
            "allowed_statuses": allowed_statuses
        }

    # Update the order status
    order.status = status

    # Save the change to PostgreSQL
    db.commit()

    # Refresh the object with the latest database values
    db.refresh(order)

    # Return the updated order
    return {
        "order_id": order.id,
        "status": order.status,
        "message": "Order status updated successfully"
    }