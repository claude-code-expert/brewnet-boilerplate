#!/bin/bash
set -euo pipefail

# Publish each stack as an independent branch
# Source of truth: develop branch's stacks/{name}/
# Output: one branch per stack with files at repo root
#
# Usage:
#   ./shared/scripts/publish-stack-branches.sh              # all stacks
#   ./shared/scripts/publish-stack-branches.sh go-gin       # single stack
#   DRY_RUN=1 ./shared/scripts/publish-stack-branches.sh    # preview only

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCE_BRANCH="${SOURCE_BRANCH:-develop}"
REMOTE="${REMOTE:-origin}"
DRY_RUN="${DRY_RUN:-0}"
PUSH="${PUSH:-1}"

ALL_STACKS=(
    go-gin
    go-echo
    go-fiber
    rust-actix-web
    rust-axum
    java-springboot
    java-spring
    kotlin-ktor
    kotlin-springboot
    nodejs-express
    nodejs-nestjs
    nodejs-nextjs
    nodejs-nextjs-full
    python-fastapi
    python-django
    python-flask
)

# If args provided, use them as stack filter
if [ $# -gt 0 ]; then
    STACKS=("$@")
else
    STACKS=("${ALL_STACKS[@]}")
fi

cd "$REPO_ROOT"

# Ensure we're on source branch and it's clean
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Switching to $SOURCE_BRANCH..."
    git checkout "$SOURCE_BRANCH"
fi

if [ -n "$(git status --porcelain)" ]; then
    echo "ERROR: Working tree is not clean. Commit or stash changes first."
    exit 1
fi

PASSED=()
FAILED=()

echo "========================================================"
echo "  Brewnet Stack Branch Publisher"
echo "  Source: $SOURCE_BRANCH | Remote: $REMOTE"
echo "  Stacks: ${#STACKS[@]}"
echo "  Dry run: $DRY_RUN | Push: $PUSH"
echo "========================================================"
echo ""

for stack in "${STACKS[@]}"; do
    BRANCH_NAME="stack/$stack"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Publishing: $stack → $BRANCH_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Verify the stack exists in git objects (not working tree)
    if ! git ls-tree -d "$SOURCE_BRANCH:stacks/$stack" > /dev/null 2>&1; then
        echo "  SKIP: stacks/$stack not found in $SOURCE_BRANCH"
        FAILED+=("$stack (not found)")
        echo ""
        continue
    fi

    if [ "$DRY_RUN" = "1" ]; then
        echo "  [DRY RUN] Would create branch $BRANCH_NAME from stacks/$stack"
        PASSED+=("$stack")
        echo ""
        continue
    fi

    # Create or reset orphan branch
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
        git checkout "$BRANCH_NAME" --quiet
        git rm -rf --quiet . 2>/dev/null || true
        # Preserve this script during clean (no .gitignore on orphan branch)
        git clean -fd --quiet --exclude='shared/' 2>/dev/null || true
    else
        git checkout --orphan "$BRANCH_NAME" 2>/dev/null || {
            echo "  ERROR: Could not create branch $BRANCH_NAME"
            FAILED+=("$stack (branch error)")
            git checkout "$SOURCE_BRANCH" --quiet 2>/dev/null
            echo ""
            continue
        }
        git rm -rf --quiet . 2>/dev/null || true
        git clean -fd --quiet --exclude='shared/' 2>/dev/null || true
    fi

    # Extract stack files directly from git objects (working tree may be empty)
    git archive "$SOURCE_BRANCH" -- "stacks/$stack/" | tar -x --strip-components=2

    # Copy validate script
    mkdir -p scripts
    git show "$SOURCE_BRANCH:shared/scripts/validate.sh" > scripts/validate.sh
    chmod +x scripts/validate.sh

    # Fix Makefile validate path
    if [ -f Makefile ]; then
        sed -i.bak 's|../../shared/scripts/validate.sh|scripts/validate.sh|g' Makefile
        rm -f Makefile.bak
    fi

    # Write .gitignore
    cat > .gitignore <<'GITIGNORE'
.env
.env.local
.env.*.local
node_modules/
dist/
build/
target/
__pycache__/
*.pyc
.venv/
venv/
*.class
*.jar
*.log
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp
*.swo
GITIGNORE

    # Stage and commit (skip if nothing changed)
    git add -A
    if git diff --cached --quiet; then
        echo "  No changes — already up to date"
        PASSED+=("$stack")
        git checkout "$SOURCE_BRANCH" --quiet
        echo ""
        continue
    fi
    git commit -m "$(cat <<EOF
chore: publish $stack stack

Auto-generated from $SOURCE_BRANCH branch.
Source: stacks/$stack/

Usage:
  git clone -b stack/$stack <repo-url> my-project
  cd my-project
  cp .env.example .env
  make dev

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
    )" --quiet

    # Push
    if [ "$PUSH" = "1" ]; then
        echo "  Pushing $BRANCH_NAME..."
        git push "$REMOTE" "$BRANCH_NAME" --force-with-lease 2>&1 | tail -2
    fi

    PASSED+=("$stack")
    echo "  Done: $BRANCH_NAME"
    echo ""

    # Return to source branch for next iteration
    git checkout "$SOURCE_BRANCH" --quiet
done

# Ensure we end on source branch
git checkout "$SOURCE_BRANCH" --quiet 2>/dev/null || true

echo ""
echo "========================================================"
echo "  RESULTS"
echo "========================================================"
echo ""
echo "  Published: ${#PASSED[@]}/${#STACKS[@]}"
for s in "${PASSED[@]}"; do echo "    ✓ $s"; done

if [ ${#FAILED[@]} -gt 0 ]; then
    echo ""
    echo "  Failed: ${#FAILED[@]}/${#STACKS[@]}"
    for s in "${FAILED[@]}"; do echo "    ✗ $s"; done
fi

echo ""
echo "========================================================"
if [ ${#FAILED[@]} -eq 0 ]; then
    echo "  All stacks published!"
    echo ""
    echo "  Usage:"
    echo "    git clone -b stack/go-gin <repo-url> my-project"
    echo "    git clone -b stack/java-springboot <repo-url> my-project"
else
    echo "  ${#FAILED[@]} stack(s) failed"
    exit 1
fi
