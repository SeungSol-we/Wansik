from app.core.db import get_db
from app.core.ids import new_id
from app.models.user import UserDocument


async def get_by_login_id(login_id: str) -> dict | None:
    return await get_db().users.find_one({"login_id": login_id})


async def get_by_id(user_id: str) -> dict | None:
    return await get_db().users.find_one({"_id": user_id})


async def create_user(
    login_id: str,
    hashed_password: str,
    school_code: str,
    grade: int,
    class_no: int,
    nickname: str,
) -> UserDocument:
    doc = UserDocument(
        _id=new_id("u"),
        school_code=school_code,
        grade=grade,
        class_no=class_no,
        nickname=nickname,
        login_id=login_id,
        hashed_password=hashed_password,
    )
    await get_db().users.insert_one(doc.model_dump(by_alias=True))
    return doc
