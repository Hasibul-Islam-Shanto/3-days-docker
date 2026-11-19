import math
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.post import Post
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.post import CreatePostInput, PostDetail, PostSummary, UpdatePostInput
from app.schemas.user import PublicUser
from app.auth.dependencies import get_current_user, get_optional_user
from app.utils.slug import generate_unique_slug
from app.utils.excerpt import build_excerpt
from app.utils.reading_time import calculate_reading_minutes

router = APIRouter(prefix="/api/posts", tags=["posts"])

def post_to_summary(post: Post, author: Optional[User] = None) -> PostSummary:
    author_user = author or post.author
    author_schema = None
    if author_user:
        author_schema = PublicUser(
            id=int(author_user.id),
            name=author_user.name,
            bio=author_user.bio or "",
            avatarUrl=author_user.avatar_url,
            joinedAt=author_user.created_at.isoformat() if author_user.created_at else "",
        )

    content_len = len(post.content) if post.content else 0
    reading_min = calculate_reading_minutes(content_len)

    return PostSummary(
        id=int(post.id),
        authorId=int(post.author_id),
        title=post.title,
        slug=post.slug,
        excerpt=post.excerpt,
        coverImage=post.cover_image,
        status=post.status,
        commentCount=int(post.comment_count),
        readingMinutes=reading_min,
        publishedAt=post.published_at.isoformat() if post.published_at else None,
        createdAt=post.created_at.isoformat() if post.created_at else "",
        updatedAt=post.updated_at.isoformat() if post.updated_at else "",
        author=author_schema,
    )

def post_to_detail(post: Post, author: Optional[User] = None) -> PostDetail:
    summary = post_to_summary(post, author)
    return PostDetail(
        **summary.model_dump(by_alias=True),
        content=post.content,
    )

@router.get("", response_model=PaginatedResponse[PostSummary])
def list_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=50),
    search: Optional[str] = Query(None),
    authorId: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit
    query = db.query(Post).filter(Post.status == "published")

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(Post.title.ilike(term), Post.excerpt.ilike(term)))

    if authorId is not None and authorId > 0:
        query = query.filter(Post.author_id == authorId)

    total = query.count()
    posts = (
        query.order_by(Post.published_at.desc(), Post.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    items = [post_to_summary(p) for p in posts]
    total_pages = math.ceil(total / limit) if limit > 0 else 0

    return PaginatedResponse[PostSummary](
        items=items,
        page=page,
        limit=limit,
        total=total,
        totalPages=total_pages,
    )

@router.get("/mine", response_model=PaginatedResponse[PostSummary])
def list_my_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit
    query = db.query(Post).filter(Post.author_id == current_user.id)

    total = query.count()
    posts = (
        query.order_by(Post.updated_at.desc(), Post.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    items = [post_to_summary(p, author=current_user) for p in posts]
    total_pages = math.ceil(total / limit) if limit > 0 else 0

    return PaginatedResponse[PostSummary](
        items=items,
        page=page,
        limit=limit,
        total=total,
        totalPages=total_pages,
    )

@router.get("/{slug}", response_model=PostDetail)
def get_post_by_slug(
    slug: str,
    optional_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Post not found"},
        )

    # Drafts are visible only to their author; don't reveal that they exist.
    if post.status != "published":
        if not optional_user or int(post.author_id) != int(optional_user.id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "NOT_FOUND", "message": "Post not found"},
            )

    return post_to_detail(post)

@router.post("", response_model=PostDetail, status_code=status.HTTP_201_CREATED)
def create_post(
    input_data: CreatePostInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post_status = input_data.status or "draft"
    slug = generate_unique_slug(db, input_data.title)
    excerpt = input_data.excerpt.strip() if input_data.excerpt else build_excerpt(input_data.content)
    cover_image = input_data.cover_image.strip() if input_data.cover_image else None
    published_at = datetime.now(timezone.utc) if post_status == "published" else None

    new_post = Post(
        author_id=current_user.id,
        title=input_data.title.strip(),
        slug=slug,
        excerpt=excerpt,
        content=input_data.content.strip(),
        cover_image=cover_image,
        status=post_status,
        comment_count=0,
        published_at=published_at,
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return post_to_detail(new_post, author=current_user)

@router.patch("/{post_id}", response_model=PostDetail)
def update_post(
    post_id: int,
    input_data: UpdatePostInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Post not found"},
        )

    if int(post.author_id) != int(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "This post belongs to another author"},
        )

    if input_data.title is not None:
        post.title = input_data.title.strip()
    if input_data.content is not None:
        post.content = input_data.content.strip()
    if input_data.excerpt is not None:
        post.excerpt = input_data.excerpt.strip() or build_excerpt(input_data.content or post.content)
    elif input_data.content is not None and not post.excerpt:
        post.excerpt = build_excerpt(post.content)

    if input_data.cover_image is not None:
        post.cover_image = input_data.cover_image.strip() or None

    if input_data.status is not None:
        post.status = input_data.status
        if input_data.status == "published" and post.published_at is None:
            post.published_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(post)

    return post_to_detail(post, author=current_user)

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Post not found"},
        )

    if int(post.author_id) != int(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "This post belongs to another author"},
        )

    db.delete(post)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
