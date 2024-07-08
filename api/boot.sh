#!/usr/bin/env bash

while true; do 
    echo "🛜 Arcwell API ${ARCWELL_NODE}:${ARCWELL_KEY} $(date +"%m-%d-%Y %H:%M:%S")"
    sleep $ARCWELL_PING
done
