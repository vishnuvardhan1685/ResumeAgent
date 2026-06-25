from typing import List
from urllib.parse import quote_plus, urljoin

import httpx
from bs4 import BeautifulSoup

from config import get_settings


async def search_internshala(query: str, location: str | None = None, limit: int = 10) -> List[dict]:
    settings = get_settings()
    slug = quote_plus(query.lower().replace(" ", "-"))
    url = f"{settings.internshala_base_url}/jobs/{slug}-jobs"
    if location:
        url = f"{url}-in-{quote_plus(location.lower().replace(' ', '-'))}"

    try:
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds, follow_redirects=True) as client:
            response = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            response.raise_for_status()
    except httpx.HTTPError:
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    jobs = []
    cards = soup.select(".individual_internship, .internship_meta")
    for card in cards[:limit]:
        title_node = card.select_one(".job-title-href, .profile, h3, a")
        company_node = card.select_one(".company-name, .company_name, .heading_6")
        location_node = card.select_one(".locations, .location_link, .location_names")
        link_node = card.select_one("a[href]")
        title = title_node.get_text(" ", strip=True) if title_node else "Internshala role"
        company = company_node.get_text(" ", strip=True) if company_node else "Internshala"
        link = urljoin(settings.internshala_base_url, link_node["href"]) if link_node else url
        jobs.append(
            {
                "title": title,
                "company": company,
                "location": location_node.get_text(" ", strip=True) if location_node else location,
                "description": card.get_text(" ", strip=True)[:1200],
                "applyLink": link,
                "source": "internshala",
            }
        )
    return jobs
