import re
from collections import defaultdict
from typing import Dict, List

try:
    import spacy
except ImportError:  # pragma: no cover - optional at runtime
    spacy = None


SKILL_KEYWORDS = {
    # --- existing ones stay ---
    "python", "javascript", "typescript", "react", "node.js", "node",
    "express", "fastapi", "django", "flask", "mongodb", "postgresql",
    "postgres", "mysql", "redis", "docker", "kubernetes", "aws", "azure",
    "gcp", "langchain", "langgraph", "machine learning", "deep learning",
    "nlp", "pandas", "numpy", "tensorflow", "pytorch", "scikit-learn",
    "git", "rest api", "graphql", "tailwind",

    # --- new additions ---
    "next.js", "nextjs", "vue", "vue.js", "angular", "svelte",
    "spring boot", "spring", "java", "c++", "c#", "golang", "go", "rust",
    "kafka", "rabbitmq", "celery",
    "terraform", "ansible", "ci/cd", "github actions", "jenkins",
    "jest", "pytest", "selenium", "cypress",
    "socket.io", "websocket", "grpc",
    "elasticsearch", "cassandra", "dynamodb", "firebase",
    "linux", "bash", "nginx",
    "figma", "html", "css",
    "hugging face", "openai", "langsmith",
    "supabase", "prisma", "mongoose",
    "stripe", "twilio", "sendgrid",
    "pydantic", "sqlalchemy", "alembic",
    "power bi", "tableau", "excel",
    "llm", "large language model", "rlhf", "lora", "fine-tuning", "fine tuning",
    "rag", "retrieval augmented generation", "prompt engineering",
    "knowledge graph", "transformer", "text to speech", "tts", "asr",
    "computer vision", "generative ai", "genai", "openai", "anthropic",
    "diffusion model", "embeddings", "vector database",
}

_NLP = None


def _get_nlp():
    global _NLP
    if spacy is None:
        return None
    if _NLP is None:
        try:
            _NLP = spacy.load("en_core_web_sm")
        except OSError:
            _NLP = spacy.blank("en")
    return _NLP


def normalize_skill(skill: str) -> str:
    aliases = {
        # existing
        "node": "Node.js",
        "node.js": "Node.js",
        "postgres": "PostgreSQL",
        "postgresql": "PostgreSQL",
        "rest api": "REST API",
        "nlp": "NLP",
        "aws": "AWS",
        "gcp": "GCP",
        # new
        "nextjs": "Next.js",
        "next.js": "Next.js",
        "vue.js": "Vue.js",
        "vue": "Vue.js",
        "ci/cd": "CI/CD",
        "socket.io": "Socket.IO",
        "golang": "Go",
        "hugging face": "Hugging Face",
        "c#": "C#",
        "c++": "C++",
    }
    key = skill.strip().lower()
    return aliases.get(key, skill.strip().title())


def extract_skills(text: str) -> List[str]:
    lowered = text.lower()
    found = []
    for skill in SKILL_KEYWORDS:
        pattern = r"(?<![a-z0-9+#])" + re.escape(skill) + r"(?![a-z0-9+#])"
        if re.search(pattern, lowered):
            found.append(normalize_skill(skill))
    return sorted(set(found), key=str.lower)


def extract_entities(text: str) -> Dict[str, List[str]]:
    nlp = _get_nlp()
    entities: Dict[str, set[str]] = defaultdict(set)
    if nlp is not None:
        doc = nlp(text[:100000])
        for ent in doc.ents:
            if ent.label_ in {"ORG", "PERSON", "GPE", "DATE"}:
                entities[ent.label_].add(ent.text.strip())

    if not entities.get("EMAIL"):
        for email in re.findall(r"[\w.+-]+@[\w-]+\.[\w.-]+", text):
            entities["EMAIL"].add(email)
    if not entities.get("PHONE"):
        for phone in re.findall(r"(?:\+?\d[\d\s().-]{7,}\d)", text):
            entities["PHONE"].add(phone.strip())

    return {label: sorted(values) for label, values in entities.items()}


def estimate_years_experience(text: str) -> float:
    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s+years?\s+(?:of\s+)?experience",
        r"experience\s+of\s+(\d+(?:\.\d+)?)\+?\s+years?",
    ]

    matches = []
    lowered = text.lower()

    for pattern in patterns:
        matches.extend(float(x) for x in re.findall(pattern, lowered))

    return max(matches) if matches else 0.0


def summarize_text(text: str, max_chars: int = 500) -> str:
    clean = re.sub(r"\s+", " ", text).strip()
    return clean[:max_chars]
