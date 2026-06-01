"""SigV4-signed request to the deployed Lambda Function URL.

Replaces awscurl for our test workflow because awscurl corrupts binary
response bodies (PDFs) when writing to disk — it decodes/re-encodes the
body as text, which mangles non-UTF-8 bytes into U+FFFD replacement chars.

Usage:
    python scripts/invoke.py <method> <path> [--data @file]

Reads INVOICE_URL and INVOICE_API_KEY from env (the Makefile sources .env
before calling this).
"""
from __future__ import annotations

import argparse
import os
import sys
from urllib.parse import urlparse

import boto3
import requests
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("method", choices=["GET", "POST"])
    p.add_argument("path")
    p.add_argument("--data", help="Request body or @path/to/file")
    p.add_argument("--output", help="Write response body to this file")
    p.add_argument("--region", default=os.environ.get("AWS_REGION", "us-east-1"))
    args = p.parse_args()

    url = os.environ["INVOICE_URL"].rstrip("/") + args.path
    api_key = os.environ.get("INVOICE_API_KEY", "")

    body: bytes | None = None
    if args.data:
        if args.data.startswith("@"):
            body = open(args.data[1:], "rb").read()
        else:
            body = args.data.encode()

    creds = boto3.Session().get_credentials().get_frozen_credentials()
    headers = {"X-API-Key": api_key, "Host": urlparse(url).netloc}
    if args.method == "POST":
        headers["Content-Type"] = "application/json"
    aws_req = AWSRequest(method=args.method, url=url, data=body, headers=headers)
    SigV4Auth(creds, "lambda", args.region).add_auth(aws_req)

    resp = requests.request(args.method, url, data=body, headers=dict(aws_req.headers))
    if args.output:
        with open(args.output, "wb") as f:
            f.write(resp.content)
        print(f"HTTP {resp.status_code} ({len(resp.content)} bytes) -> {args.output}")
    else:
        sys.stdout.buffer.write(resp.content)
    return 0 if resp.ok else 1


if __name__ == "__main__":
    sys.exit(main())
