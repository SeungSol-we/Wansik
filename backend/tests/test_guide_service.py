from app.models.meal import MealItem
from app.services.guide_service import _build_eating_order


def test_eating_order_sorts_by_category():
    items = [
        MealItem(meal_item_id="mi_00", food_id="f1", food_name_raw="현미밥"),
        MealItem(meal_item_id="mi_01", food_id="f2", food_name_raw="제육볶음"),
        MealItem(meal_item_id="mi_02", food_id="f3", food_name_raw="시금치나물"),
    ]
    foods_by_id = {
        "f1": {"category": "탄수화물"},
        "f2": {"category": "단백질"},
        "f3": {"category": "채소"},
    }

    ordered, unclassified = _build_eating_order(items, foods_by_id)

    assert ordered[:3] == ["시금치나물", "제육볶음", "현미밥"]
    assert unclassified == []


def test_eating_order_puts_unmatched_food_last():
    items = [
        MealItem(meal_item_id="mi_00", food_id="f1", food_name_raw="현미밥"),
        MealItem(meal_item_id="mi_01", food_id=None, food_name_raw="정체불명음식"),
    ]
    foods_by_id = {"f1": {"category": "탄수화물"}}

    ordered, unclassified = _build_eating_order(items, foods_by_id)

    assert ordered == ["현미밥", "정체불명음식"]
    assert unclassified == ["정체불명음식"]
