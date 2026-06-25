import argparse
import asyncio
import csv
from pathlib import Path

from db.postgres import close_pool, upsert_job_embedding
from tools.embedding_tools import embed_text


async def seed(csv_path: Path, id_column: str, text_column: str) -> int:
    count = 0
    with csv_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            source_id = row.get(id_column) or f"{csv_path.stem}-{count}"
            text = row.get(text_column) or ""
            if not text.strip():
                continue
            await upsert_job_embedding(source_id, text, embed_text(text))
            count += 1
    await close_pool()
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed pgvector from a CSV dataset.")
    parser.add_argument("csv_path", type=Path)
    parser.add_argument("--id-column", default="id")
    parser.add_argument("--text-column", default="description")
    args = parser.parse_args()
    count = asyncio.run(seed(args.csv_path, args.id_column, args.text_column))
    print(f"Seeded {count} embeddings")


if __name__ == "__main__":
    main()
