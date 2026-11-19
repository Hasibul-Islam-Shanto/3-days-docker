from typing import Optional, Literal
from pydantic import Field
from app.schemas.common import CamelModel
from app.schemas.user import PublicUser

PostStatus = Literal["draft", "published"]

class PostSummary(CamelModel):
    id: int
    author_id: int
    title: str
    slug: str
    excerpt: str
    cover_image: Optional[str] = None
    status: PostStatus
    comment_count: int
    reading_minutes: int
    published_at: Optional[str] = None
    created_at: str
    updated_at: str
    author: Optional[PublicUser] = None

class PostDetail(PostSummary):
    content: str

class CreatePostInput(CamelModel):
    title: str = Field(..., min_length=3, max_length=160)
    content: str = Field(..., min_length=10, max_length=100000)
    excerpt: Optional[str] = Field(None, max_length=320)
    cover_image: Optional[str] = Field(None, max_length=500)
    status: Optional[PostStatus] = "draft"

class UpdatePostInput(CamelModel):
    title: Optional[str] = Field(None, min_length=3, max_length=160)
    content: Optional[str] = Field(None, min_length=10, max_length=100000)
    excerpt: Optional[str] = Field(None, max_length=320)
    cover_image: Optional[str] = Field(None, max_length=500)
    status: Optional[PostStatus] = None
