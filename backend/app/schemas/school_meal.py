from pydantic import BaseModel


class SchoolMealItemResponse(BaseModel):
    food_name_raw: str
    category: str


class SchoolMealResponse(BaseModel):
    school_code: str
    date: str
    meal_type: str
    available: bool
    items: list[SchoolMealItemResponse]
