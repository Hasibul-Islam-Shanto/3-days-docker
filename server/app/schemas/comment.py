from __future__ import annotations
from typing import List, Optional
from pydantic import Field
from app.schemas.common import CamelModel
from app.schemas.user import PublicUser

class CreateCommentInput(CamelModel):
    content: str = Field(..., min_length=2, max_length=2000)
    parent_id: Optional[int] = None

class BlogComment(CamelModel):
    id: int
    post_id: int
    author_id: int
    parent_id: Optional[int] = None
    content: str
    created_at: str
    author: Optional[PublicUser] = None
    replies: List[BlogComment] = []

class CommentListResponse(CamelModel):
    items: List[BlogComment]
    total: int
