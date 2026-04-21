# engine/core/crawler.py

from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from engine.utils.http_client import HTTPClient


class Crawler:
    def __init__(self, base_url, max_depth=2, max_urls=50):
        self.base_url = base_url
        self.max_depth = max_depth
        self.max_urls = max_urls

        self.client = HTTPClient()

        self.visited = set()
        self.to_visit = [(base_url, 0)]

    def crawl(self):
        results = []

        while self.to_visit and len(self.visited) < self.max_urls:
            url, depth = self.to_visit.pop(0)

            if url in self.visited or depth > self.max_depth:
                continue

            print(f"LOG:Infiltration tactique sur {url}...")

            try:
                response = self.client.get(url)

                if not response:
                    continue
                
                content_type = response.headers.get("Content-Type", "").lower()
                if "text/html" not in content_type:
                    continue

                self.visited.add(url)

                page_data = {
                    "url": url,
                    "html": response.text,
                    "links": self.extract_links(response.text, url),
                    "forms": self.extract_forms(response.text, url)
                }

                results.append(page_data)

                for link in page_data["links"]:
                    if link not in self.visited:
                        print(f"LOG:[Crawling] {url}")
                        self.to_visit.append((link, depth + 1))

            except Exception as e:
                print(f"LOG:[Error] {url} -> {e}")

        return results

    def extract_links(self, html, current_url):
        links = set()

        soup = BeautifulSoup(html, "html.parser")

        for tag in soup.find_all("a", href=True):
            href = tag["href"]
            full_url = urljoin(current_url, href)

            if self.is_valid(full_url):
                links.add(full_url)

        return list(links)

    def extract_forms(self, html, current_url):
        forms = []
        soup = BeautifulSoup(html, "html.parser")

        for form in soup.find_all("form"):
            action = form.get("action")
            method = form.get("method", "get").lower()

            action_url = urljoin(current_url, action) if action else current_url

            inputs = []
            for input_tag in form.find_all("input"):
                inputs.append({
                    "name": input_tag.get("name"),
                    "type": input_tag.get("type", "text")
                })

            forms.append({
                "action": action_url,
                "method": method,
                "inputs": inputs
            })

        return forms

    def is_valid(self, url):
        parsed = urlparse(url)
        base = urlparse(self.base_url)

        return (
            parsed.scheme in ("http", "https")
            and parsed.netloc == base.netloc
        )
