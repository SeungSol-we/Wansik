"""
4.1 users 컬렉션
"""
from datetime import datetime, timezone

from pydantic import BaseModel, Field


class UserDocument(BaseModel):
    id: str = Field(alias="_id")
    school_code: str
    school_name: str = ""
    grade: int
    class_no: int
    nickname: str
    login_id: str
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}
