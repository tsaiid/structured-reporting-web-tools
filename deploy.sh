#!/bin/bash

# Define paths (using absolute paths to avoid confusion)
# Current directory is assumed to be the project root where the script is run
DIST_DIR="$(pwd)/dist"
TARGET_DIR="$(pwd)/../radtools.tsai.it/structure-report"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==> Starting Deployment Process <==${NC}"

# 1. Build project
echo -e "${GREEN}1. Building project...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! stopping deployment.${NC}"
    exit 1
fi

# 2. Check target directory
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}Target directory not found: $TARGET_DIR${NC}"
    echo "Please make sure you have cloned the 'radtools.tsai.it' repo next to this project."
    exit 1
fi

# 3. Synchronize files (using rsync to mirroring, excluding .git)
# -a: archive mode (preserves permissions, etc.)
# -v: verbose
# --delete: delete extraneous files from dest dirs (keep it clean)
# --exclude '.git': protect the git repository metadata
# --exclude 'ajcc8', 'ajcc9', 'vendor': preserve legacy directories not managed by this build
echo -e "${GREEN}2. Syncing files to deployment target...${NC}"
rsync -av --delete --exclude '.git' --exclude 'ajcc8' --exclude 'ajcc9' --exclude 'vendor' "$DIST_DIR/" "$TARGET_DIR/"

# 4. Git operations in target repo
echo -e "${GREEN}3. Committing and pushing changes...${NC}"
cd "$TARGET_DIR" || exit

# Check if we are really in a git repo (works even in subdirectories)
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo -e "${RED}Destination is not a git repository!${NC}"
    exit 1
fi

# Add changes
git add .

# Commit (check if there are changes first)
if git diff-index --quiet HEAD --; then
    echo "No changes detected in build output. Nothing to commit."
else
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

    # Push
    echo -e "${GREEN}Pushing to remote...${NC}"
    git push
fi

echo -e "${GREEN}==> Deployment Successfully Completed! <==${NC}"
