from typing import List, Dict, Optional
from app.models.comment import Comment
from app.schemas.comment import BlogComment
from app.schemas.user import PublicUser

def build_comment_tree(
    comments: List[Comment],
    author_map: Dict[int, Optional[PublicUser]]
) -> List[BlogComment]:
    nodes: Dict[int, BlogComment] = {}

    for c in comments:
        c_id = int(c.id)
        author = author_map.get(int(c.author_id))
        created_at_str = c.created_at.isoformat() if c.created_at else ""
        nodes[c_id] = BlogComment(
            id=c_id,
            postId=int(c.post_id),
            authorId=int(c.author_id),
            parentId=int(c.parent_id) if c.parent_id is not None else None,
            content=c.content,
            createdAt=created_at_str,
            author=author,
            replies=[],
        )

    roots: List[BlogComment] = []
    for c in comments:
        node = nodes.get(int(c.id))
        if not node:
            continue
        if c.parent_id is not None and int(c.parent_id) in nodes:
            parent_node = nodes[int(c.parent_id)]
            parent_node.replies.append(node)
        else:
            roots.append(node)

    return roots
