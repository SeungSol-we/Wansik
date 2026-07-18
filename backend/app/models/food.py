"""
4.3 foods 컬렉션 (음식 마스터)
"""
from pydantic import BaseModel, Field


class FoodDocument(BaseModel):
    id: str = Field(alias="_id")
    name: str
    category: str  # 채소 / 단백질 / 탄수화물 / 국물 / 후식 등 (5.3 정렬 기준)
    tags: list[str] = Field(default_factory=list)
    allergens: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True}
