import re

def build_excerpt(content: str) -> str:
    compact = re.sub(r"\s+", " ", content).strip()
    if len(compact) <= 200:
        return compact
    return f"{compact[:197].rstrip()}…"
