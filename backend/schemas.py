from pydantic import BaseModel


class RestaurantCreate(BaseModel):
    name: str
    description: str | None = None
    location: str | None = None
    image_url: str | None = None


class RestaurantResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    location: str | None = None
    image_url: str | None = None
    is_active: bool

class MenuItemCreate(BaseModel):
    restaurant_id: int
    name: str
    description: str | None = None
    price: float
    image_url: str | None = None


class MenuItemResponse(BaseModel):
    id: int
    restaurant_id: int
    name: str
    description: str | None = None
    price: float
    image_url: str | None = None
    is_available: bool

class CartItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = 1


class CartItemResponse(BaseModel):
    id: int
    cart_id: int
    menu_item_id: int
    quantity: int

class OrderResponse(BaseModel):
    id: int
    cart_id: int
    total_amount: float
    status: str

    class Config:
        from_attributes = True

    
    


