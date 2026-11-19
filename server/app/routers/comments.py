from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.comment import BlogComment, CommentListResponse, CreateCommentInput
from app.schemas.user import PublicUser
from app.auth.dependencies import get_current_user
from app.utils.comment_tree import build_comment_tree

router = APIRouter(tags=["comments"])

def get_author_public_schema(user: Optional[User]) -> Optional[PublicUser]:
    if not user:
        return None
    return PublicUser(
        id=int(user.id),
        name=user.name,
        bio=user.bio or "",
        avatarUrl=user.avatar_url,
        joinedAt=user.created_at.isoformat() if user.created_at else "",
    )

@router.get("/api/posts/{post_id}/comments", response_model=CommentListResponse)
def list_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or post.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Post not found"},
        )

    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc(), Comment.id.asc())
        .all()
    )

    author_ids = list({int(c.author_id) for c in comments})
    author_map: Dict[int, Optional[PublicUser]] = {}
    if author_ids:
        users = db.query(User).filter(User.id.in_(author_ids)).all()
        for u in users:
            author_map[int(u.id)] = get_author_public_schema(u)

    items = build_comment_tree(comments, author_map)
    return CommentListResponse(items=items, total=len(comments))

@router.post("/api/posts/{post_id}/comments", response_model=BlogComment, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    input_data: CreateCommentInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or post.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Post not found"},
        )

    if input_data.parent_id is not None:
        parent = (
            db.query(Comment)
            .filter(Comment.id == input_data.parent_id, Comment.post_id == post_id)
            .first()
        )
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "NOT_FOUND", "message": "The comment you are replying to no longer exists"},
            )

    new_comment = Comment(
        post_id=post_id,
        author_id=current_user.id,
        parent_id=input_data.parent_id,
        content=input_data.content.strip(),
    )
    db.add(new_comment)
    post.comment_count += 1
    db.commit()
    db.refresh(new_comment)

    return BlogComment(
        id=int(new_comment.id),
        postId=int(new_comment.post_id),
        authorId=int(new_comment.author_id),
        parentId=int(new_comment.parent_id) if new_comment.parent_id is not None else None,
        content=new_comment.content,
        createdAt=new_comment.created_at.isoformat() if new_comment.created_at else "",
        author=get_author_public_schema(current_user),
        replies=[],
    )

@router.delete("/api/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Comment not found"},
        )

    post = db.query(Post).filter(Post.id == comment.post_id).first()

    # Allowed if comment author OR post author (moderator)
    allowed = (int(comment.author_id) == int(current_user.id)) or (
        post is not None and int(post.author_id) == int(current_user.id)
    )
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "You can only delete your own comments"},
        )

    post_id = int(comment.post_id)
    db.delete(comment)
    db.flush()

    # Recalculate accurate comment count for the post
    if post:
        new_count = db.query(func.count(Comment.id)).filter(Comment.post_id == post_id).scalar() or 0
        post.comment_count = new_count

    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
