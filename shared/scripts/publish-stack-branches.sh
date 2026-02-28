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
    STACK_DIR="$REPO_ROOT/stacks/$stack"
    BRANCH_NAME="stack/$stack"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Publishing: $stack → $BRANCH_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if [ ! -d "$STACK_DIR" ]; then
        echo "  SKIP: $STACK_DIR does not exist"
        FAILED+=("$stack (not found)")
        echo ""
        continue
    fi

    if [ "$DRY_RUN" = "1" ]; then
        echo "  [DRY RUN] Would create branch $BRANCH_NAME from $STACK_DIR"
        PASSED+=("$stack")
        echo ""
        continue
    fi

    # Create orphan branch (no history from develop)
    git checkout --orphan "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME" 2>/dev/null || {
        echo "  ERROR: Could not create/checkout branch $BRANCH_NAME"
        FAILED+=("$stack (branch error)")
        git checkout "$SOURCE_BRANCH" 2>/dev/null
        echo ""
        continue
    }

    # Remove all tracked files from index
    git rm -rf --quiet . 2>/dev/null || true

    # Clean untracked files (but keep .git)
    git clean -fd --quiet 2>/dev/null || true

    # Copy stack files to root
    cp -R "$STACK_DIR/"* .
    cp -R "$STACK_DIR/".* . 2>/dev/null || true  # hidden files like .env.example

    # Copy shared validate script
    mkdir -p scripts
    cp "$REPO_ROOT/shared/scripts/validate.sh" scripts/

    # Fix Makefile validate path
    if [ -f Makefile ]; then
        sed -i.bak 's|../../shared/scripts/validate.sh|scripts/validate.sh|g' Makefile
        rm -f Makefile.bak
    fi

    # Add .gitignore
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

    # Stage and commit
    git add -A
    git commit -m "$(cat <<EOF
chore: publish $stack stack

Auto-generated from $SOURCE_BRANCH branch.
Source: stacks/$stack/

Usage:
  git clone -b stack/$stack <repo-url> my-project
  cd my-project
  cp .env.example .env
  make dev

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
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
