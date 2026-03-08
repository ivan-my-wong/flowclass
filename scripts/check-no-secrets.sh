#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Running secret exposure checks..."

python3 - <<'PY'
from pathlib import Path
import re
import sys

root = Path('.').resolve()
excluded_dirs = {'node_modules', '.git', '.next', 'dist', 'build'}

def should_skip(path: Path) -> bool:
    return any(part in excluded_dirs for part in path.parts)

# 1) Block accidental commit of non-example env files.
env_files = []
for path in root.rglob('.env*'):
    rel = path.relative_to(root)
    name = path.name
    if should_skip(path):
        continue
    if name == '.env.example' or name.endswith('.env.example') or '.env.' in name and name.endswith('.example'):
        continue
    env_files.append(str(rel))

if env_files:
    print('ERROR: Found non-example env files. Remove these before publishing:')
    for item in sorted(env_files):
        print(item)
    sys.exit(1)

token_pattern = re.compile(
    r'(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|sk_(live|test)_[0-9A-Za-z]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[baprs]-[0-9A-Za-z-]{10,})',
    re.IGNORECASE,
)
assignment_pattern = re.compile(
    r'(STRIPE_SECRET_KEY|AWS_SECRET_ACCESS_KEY|SMTP_PASS|TWILIO_AUTH_TOKEN|FLOWCLASS__API_TOKEN|AZURE_OPENAI_KEY|VITE_AZURE_OPENAI_KEY)\s*[:=]\s*["\']([^"\']+)["\']',
    re.IGNORECASE,
)

matches = []
for path in root.rglob('*'):
    if not path.is_file() or should_skip(path):
        continue
    if path.name.endswith('.example'):
        continue
    try:
        content = path.read_text(encoding='utf-8')
    except Exception:
        continue
    for i, line in enumerate(content.splitlines(), start=1):
        assignment_match = assignment_pattern.search(line)
        if assignment_match:
            key_name = assignment_match.group(1)
            assigned_value = assignment_match.group(2)
            # Allow constant-key declarations such as: X = 'X'
            if key_name.lower() == assigned_value.lower():
                assignment_match = None
        if token_pattern.search(line) or assignment_match:
            matches.append(f'{path.relative_to(root)}:{i}:{line.strip()}')
            if len(matches) >= 50:
                break
    if len(matches) >= 50:
        break

if matches:
    print('ERROR: Potential secrets detected:')
    for match in matches:
        print(match)
    sys.exit(1)

print('Secret checks passed.')
PY
