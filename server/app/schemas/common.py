from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

T = TypeVar("T")

class PaginatedResponse(CamelModel, Generic[T]):
    items: List[T]
    page: int
    limit: int
    total: int
    total_pages: int

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class ErrorEnvelope(BaseModel):
    error: ErrorDetail
