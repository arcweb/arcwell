#!/bin/sh

# Git Pre-commit Hook
#
# Performs required code quality checks and alterations before confirming
# commit may proceed.
#
# To install, run project bootstrap.sh script or directly copy into place
# with local .git folder:
#  cp scripts/git-pre-commit.sh .git/hooks/pre-commit
#

# TODO: Add API lint invocation and auto-lint to pre-commit
# TODO: Add UI lint invocation and auto-lint to pre-commit

# If pre-commit hook exits with a non-zero exit code, the git commit will
# fail and developer will have an opportunity to correct.
