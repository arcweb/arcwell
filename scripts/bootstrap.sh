#!/usr/bin/env bash

# Developer bootstrapping script
#
# New project developers should run this bootstrapping script when setting up
# their local development environments in order to:
#  * Copy example dev and test environment files into place
#  * Install any application-specific git hooks
#  * Perform other automated environment configuration
#

PREFIX="arcwell-bootstrap"
prefix_echo () {
    msg="$1"
    echo "$(tput setaf 45)${PREFIX}$(tput sgr0) ${msg}"
}

WORK_DIR=$(pwd)
SCRIPTS_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd )"
PROJECT_DIR="$( cd "$SCRIPTS_DIR/.." && pwd )"

# Welcome
prefix_echo "🌎 Bootstrapping local environment"

# Run sub-package bootstrap scripts, if present:
prefix_echo "🔍 Looking for bootstrap scripts in packages..."
for dir in packages/*/ ; do
  prefix_echo "-> Checking ./$dir"
  if [ "$dir" == "scripts/" ]; then continue; fi
  if [ -d "${PROJECT_DIR}/${dir}/scripts" ] && [ -f "${PROJECT_DIR}/${dir}scripts/bootstrap.sh" ]; then
    prefix_echo "-> Found bootsrap script in $dir, Running..."
    cd $PROJECT_DIR/${dir} && ./scripts/bootstrap.sh
    prefix_echo "-> Done Running"
  fi
done

# Install Git Hooks:
prefix_echo "🪝 Installing git pre-commit hook..."
cp -v "${SCRIPTS_DIR}/git-pre-commit.sh" "${PROJECT_DIR}/.git/hooks/pre-commit"
chmod +x "${PROJECT_DIR}/.git/hooks/pre-commit"

prefix_echo "🌎 Done bootstrapping local environment"
