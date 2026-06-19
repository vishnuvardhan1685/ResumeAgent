agent_service/
│
├── main.py                  # FastAPI app init, mounts routers, CORS, lifespan
├── graph.py                 # LangGraph StateGraph wiring
├── state.py                 # PipelineState TypedDict
│
├── agents/
│   ├── __init__.py
│   ├── extractor.py         # Agent 1 — skills + structured extraction
│   ├── matcher.py           # Agent 2 — embeddings + scoring
│   ├── interviewer.py       # Agent 3 — question generation
│   ├── editor.py            # Agent 4 — resume rewrite suggestions
│   └── job_discovery.py     # Agent 5 — SerpAPI + Internshala + ranking
│
├── tools/
│   ├── __init__.py
│   ├── pdf_tools.py         # pdfplumber PDF text extraction
│   ├── nlp_tools.py         # spaCy NER + skill list matching
│   ├── embedding_tools.py   # sentence-transformers + pgvector CRUD
│   ├── serpapi_tools.py     # Google Jobs via SerpAPI
│   └── internshala_tools.py # Internshala scraper (requests + BS4)
│
├── routers/
│   ├── __init__.py
│   ├── parse.py             # POST /parse-pdf  (called by Node on resume upload)
│   ├── analyze.py           # POST /analyze    (full pipeline, SSE stream)
│   └── discover.py          # POST /discover   (job discovery)
│
├── models/                  # Pydantic schemas only (no ORM here)
│   ├── __init__.py
│   ├── requests.py          # AnalyzeRequest, DiscoverRequest, ParseRequest
│   └── responses.py         # ExtractedData, MatchResult, JobListing, etc.
│
├── db/
│   ├── __init__.py
│   ├── postgres.py          # asyncpg pool init + pgvector helpers
│   └── mongo.py             # motor (async MongoDB client) — for writing results back
│
├── config.py                # Pydantic Settings — reads .env
│
├── scripts/
│   └── seed_pgvector.py     # One-time: embed Kaggle datasets → insert into pgvector
│
├── tests/
│   ├── test_extractor.py
│   ├── test_matcher.py
│   └── test_pdf_tools.py
│
├── requirements.txt
├── Dockerfile
└── .env.example