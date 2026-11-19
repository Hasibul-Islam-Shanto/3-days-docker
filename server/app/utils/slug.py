import re
import secrets
import unicodedata
from sqlalchemy.orm import Session
from app.models.post import Post

def slugify(value: str) -> str:
    # Normalize unicode characters to decomposed form
    norm = unicodedata.normalize("NFKD", value)
    # Remove accent characters
    clean = "".join(c for c in norm if not unicodedata.combining(c))
    clean = clean.lower()
    clean = re.sub(r"['’]", "", clean)
    clean = re.sub(r"[^a-z0-9]+", "-", clean)
    clean = re.sub(r"^-+|-+$", "", clean)
    return clean[:80]

def random_suffix() -> str:
    return secrets.token_hex(3)

def generate_unique_slug(db: Session, title: str) -> str:
    base = slugify(title) or "post"
    for attempt in range(5):
        candidate = base if attempt == 0 else f"{base}-{random_suffix()}"
        exists = db.query(Post.id).filter(Post.slug == candidate).first()
        if not exists:
            return candidate
    return f"{base}-{secrets.token_hex(4)}"
