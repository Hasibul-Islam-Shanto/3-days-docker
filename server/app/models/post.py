from datetime import datetime
from sqlalchemy import BigInteger, Column, String, Text, Integer, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    author_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(160), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    excerpt = Column(String(320), default="", nullable=False)
    content = Column(Text, nullable=False)
    cover_image = Column(String(500), nullable=True)
    status = Column(String(20), default="draft", nullable=False, index=True)
    comment_count = Column(Integer, default=0, nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_posts_status_published", "status", "published_at"),
        Index("idx_posts_author", "author_id", "updated_at"),
    )
