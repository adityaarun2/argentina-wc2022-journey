#!/usr/bin/env python3
import os
import re
import time
from pathlib import Path

import requests

# Teams appearing in 2022 knockouts JSON
TEAM_TO_FLAGCDN_CODE = {
    "Netherlands": "nl",
    "United States": "us",
    "Argentina": "ar",
    "Australia": "au",
    "Croatia": "hr",
    "Japan": "jp",
    "Brazil": "br",
    "Korea Republic": "kr",
    "Morocco": "ma",
    "Spain": "es",
    "Portugal": "pt",
    "Switzerland": "ch",
    "France": "fr",
    "Poland": "pl",
    "England": "gb-eng",  # England (not UK)
    "Senegal": "sn",
}

OUT_DIR = Path("images/flags")

def slugify(name: str) -> str:
    s = name.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    return s

def download(url: str, out_path: Path, session: requests.Session, retries: int = 3) -> bool:
    for attempt in range(1, retries + 1):
        try:
            r = session.get(url, timeout=20)
            if r.status_code == 200 and r.content:
                out_path.write_bytes(r.content)
                return True
            print(f"  ! {out_path.name}: HTTP {r.status_code}")
        except requests.RequestException as e:
            print(f"  ! {out_path.name}: {e}")
        time.sleep(0.8 * attempt)
    return False

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # flagcdn sizes: w40/w80/w160/w320...
    size = "w80"  # good for your bracket rows

    with requests.Session() as session:
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (flag downloader for personal project)"
        })

        for team, code in TEAM_TO_FLAGCDN_CODE.items():
            filename = f"{slugify(team)}.png"
            out_path = OUT_DIR / filename

            if out_path.exists() and out_path.stat().st_size > 0:
                print(f"exists: {filename}")
                continue

            url = f"https://flagcdn.com/{size}/{code}.png"
            print(f"↓ {team} -> {filename}")

            ok = download(url, out_path, session)
            if not ok:
                print(f"failed: {team} ({url})")

    print(f"\nDone. Flags saved in: {OUT_DIR.resolve()}")

if __name__ == "__main__":
    main()
