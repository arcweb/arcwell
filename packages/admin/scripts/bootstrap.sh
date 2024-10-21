#!/usr/bin/env bash

# Bootstrap Script
# This script should be run by developers to configure and update their
# local development environment. It populates environment files and
# makes other preparations for running code locally.

SCRIPTS_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd )"
PACKAGE_DIR="$( cd "$SCRIPTS_DIR/.." && pwd )"

echo "Generating local development environment from example..."

FILE="$PACKAGE_DIR/.env.development"
if [ -f "$FILE" ]; then
    echo "$FILE already exists. Skipping generation."
else
    __APP_KEY__="$(uuidgen)" \
    envsubst < $PACKAGE_DIR/.env.example > $PACKAGE_DIR/.env.development
    echo "$FILE generated."
fi

echo "Done"
