#!/bin/bash

# Run ./build.sh --watch for watchmode

rm -rf build/
tsc $@ --allowJs --outDir build/ src/*
