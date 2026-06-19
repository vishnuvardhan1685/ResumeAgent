import hashlib
import math
from typing import Iterable, List, Sequence

try:
    from sentence_transformers import SentenceTransformer
except ImportError:  # pragma: no cover - optional at runtime
    SentenceTransformer = None

from config import get_settings

_MODEL = None


def _hash_embedding(text: str, dimensions: int = 384) -> List[float]:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    values = []
    seed = digest
    while len(values) < dimensions:
        seed = hashlib.sha256(seed).digest()
        values.extend((byte - 127.5) / 127.5 for byte in seed)
    return values[:dimensions]


def _get_model():
    global _MODEL
    if SentenceTransformer is None:
        return None
    if _MODEL is None:
        try:
            _MODEL = SentenceTransformer(get_settings().embedding_model_name)
        except Exception:
            _MODEL = False
    if _MODEL is False:
        return None
    return _MODEL


def embed_text(text: str) -> List[float]:
    model = _get_model()
    if model is None:
        return _hash_embedding(text)
    return model.encode(text or "", normalize_embeddings=True).tolist()


def cosine_similarity(left: Sequence[float], right: Sequence[float]) -> float:
    if not left or not right:
        return 0
    dot = sum(a * b for a, b in zip(left, right))
    left_norm = math.sqrt(sum(a * a for a in left))
    right_norm = math.sqrt(sum(b * b for b in right))
    if left_norm == 0 or right_norm == 0:
        return 0
    return max(0, min(1, dot / (left_norm * right_norm)))


def rank_by_similarity(query: str, candidates: Iterable[dict], text_key: str) -> List[dict]:
    query_vector = embed_text(query)
    ranked = []
    for candidate in candidates:
        candidate_text = str(candidate.get(text_key) or "")
        score = cosine_similarity(query_vector, embed_text(candidate_text))
        ranked.append({**candidate, "matchScore": round(score * 100, 2)})
    return sorted(ranked, key=lambda item: item.get("matchScore", 0), reverse=True)
