#!/usr/bin/env bash

# Test boot script; delete or replace once working app is included

while true; do 
    echo "🛜 Arcwell API ${ARCWELL_NODE}:${ARCWELL_KEY} $(date +"%m-%d-%Y %H:%M:%S")"
    sleep $ARCWELL_PING
done
