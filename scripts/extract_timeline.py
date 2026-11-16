"""Copy the lane payload of chosen runs out of a timeline report.

    python scripts/extract_timeline.py <timeline-report.html> data/timeline.json <report-tag>=<deck-tag> ...
"""

import json
import re
import sys

ARM_FIELDS = ("wall_ms", "bins", "ranks", "phases")
PAYLOAD_FIELDS = ("bin_ms", "sources", "groups", "phases")


def payload(report_html: str) -> dict:
    match = re.search(r'<script id="payload" type="application/json">(.*?)</script>', report_html, re.S)
    return json.loads(match.group(1))


def main(report_path: str, output_path: str, *renames: str) -> None:
    source = payload(open(report_path).read())
    arms = {arm["tag"]: arm for arm in source["arms"]}
    kept = {field: source[field] for field in PAYLOAD_FIELDS}
    kept["arms"] = [
        {"tag": deck_tag, **{field: arms[report_tag][field] for field in ARM_FIELDS}}
        for report_tag, deck_tag in (rename.split("=") for rename in renames)
    ]
    with open(output_path, "w") as output:
        json.dump(kept, output, separators=(",", ":"))


if __name__ == "__main__":
    main(*sys.argv[1:])
