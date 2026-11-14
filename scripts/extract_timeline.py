"""Copy the lane payload out of the exp-64 timeline report.

    python scripts/extract_timeline.py <timeline-report.html> data/timeline.json
"""

import json
import re
import sys

ARM_FIELDS = ("tag", "wall_ms", "bins", "ranks", "phases")
PAYLOAD_FIELDS = ("bin_ms", "sources", "groups", "phases")


def payload(report_html: str) -> dict:
    match = re.search(r'<script id="payload" type="application/json">(.*?)</script>', report_html, re.S)
    return json.loads(match.group(1))


def main(report_path: str, output_path: str) -> None:
    source = payload(open(report_path).read())
    kept = {field: source[field] for field in PAYLOAD_FIELDS}
    kept["arms"] = [{field: arm[field] for field in ARM_FIELDS} for arm in source["arms"]]
    with open(output_path, "w") as output:
        json.dump(kept, output, separators=(",", ":"))


if __name__ == "__main__":
    main(*sys.argv[1:])
