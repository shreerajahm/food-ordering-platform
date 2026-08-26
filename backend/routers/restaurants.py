from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Restaurant
from schemas import RestaurantCreate, RestaurantResponse


router = APIRouter(
    prefix="/restaurants",
    tags=["Restaurants"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=RestaurantResponse)
def create_restaurant(
    restaurant: RestaurantCreate,
    db: Session = Depends(get_db)
):
    new_restaurant = Restaurant(
        name=restaurant.name,
        description=restaurant.description,
        location=restaurant.location,
        image_url=restaurant.image_url
    )

    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)

    return new_restaurant


@router.get("/", response_model=list[RestaurantResponse])
def get_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).all()
