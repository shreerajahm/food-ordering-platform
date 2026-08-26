from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from datetime import datetime

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500))
    location = Column(String(200))
    image_url = Column(String(500))
    is_active = Column(Boolean, default=True)

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(500))
    price = Column(Float, nullable=False)
    image_url = Column(String(500))
    is_available = Column(Boolean, default=True)

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)

    items = relationship(
        "CartItem",
        back_populates="cart",
        cascade="all, delete-orphan"
    )


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)

    cart_id = Column(
        Integer,
        ForeignKey("carts.id"),
        nullable=False
    )

    menu_item_id = Column(
        Integer,
        ForeignKey("menu_items.id"),
        nullable=False
    )

    quantity = Column(Integer, nullable=False, default=1)

    cart = relationship(
        "Cart",
        back_populates="items"
    )

    menu_item = relationship(
        "MenuItem"
    )

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    cart_id = Column(
        Integer,
        ForeignKey("carts.id"),
        nullable=False
    )

    total_amount = Column(Float, nullable=False)

    status = Column(
        String(50),
        nullable=False,
        default="placed"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False
    )

    menu_item_id = Column(
        Integer,
        ForeignKey("menu_items.id"),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    price = Column(
        Float,
        nullable=False
    )

    order = relationship(
        "Order",
        back_populates="items"
    )

    menu_item = relationship(
        "MenuItem"
    )