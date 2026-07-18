from pydantic import BaseModel


class SchoolSearchResult(BaseModel):
    school_code: str
    school_name: str
    school_level: str
    region: str
    address: str | None = None


class SchoolSearchResponse(BaseModel):
    results: list[SchoolSearchResult]