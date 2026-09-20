#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Running secret exposure checks..."

python3 - <<'PY'
import os
from pathlib import Path
import re
import sys

root = Path('.').resolve()
excluded_dirs = {'node_modules', '.git', '.next', 'dist', 'build', '.turbo'}

# 1) Block accidental commit/tracking of non-example env files.
import subprocess
try:
    tracked_files = subprocess.check_output(['git', 'ls-files'], text=True).splitlines()
    tracked_env = [
        f for f in tracked_files
        if (Path(f).name.startswith('.env') or f.endswith('.env'))
        and not (f.endswith('.example') or '.env.example' in f)
    ]
    if tracked_env:
        print('ERROR: Found tracked non-example env files in git. Remove these from git:')
        for item in sorted(tracked_env):
            print(item)
        sys.exit(1)
except Exception:
    pass

token_pattern = re.compile(
    r'(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|sk_(live|test)_[0-9A-Za-z]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[baprs]-[0-9A-Za-z-]{10,})',
    re.IGNORECASE,
)
assignment_pattern = re.compile(
    r'(STRIPE_SECRET_KEY|AWS_SECRET_ACCESS_KEY|SMTP_PASS|TWILIO_AUTH_TOKEN|FLOWCLASS__API_TOKEN|AZURE_OPENAI_KEY|VITE_AZURE_OPENAI_KEY)\s*[:=]\s*["\']([^"\']+)["\']',
    re.IGNORECASE,
)

matches = []
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in excluded_dirs]
    for filename in filenames:
        if filename.endswith('.example') or filename.endswith('.png') or filename.endswith('.jpg') or filename.endswith('.ico') or filename.endswith('.webp'):
            continue
        path = Path(dirpath, filename)
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
