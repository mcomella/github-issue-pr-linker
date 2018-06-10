#!/bin/bash

rmdir build/
tsc --allowJs --outDir build/ src/*
