#!/usr/bin/env bash

# Arcwell Server Boot Script for Metal
# Use this script for a shorthand to load environment when developing
# "on metal"

node --env-file=".env.example" ace serve --watch
