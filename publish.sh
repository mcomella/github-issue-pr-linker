#!/bin/bash

rm -rf out/
mkdir out/

tsc && \
    tsc -p src/options && \
    tsc -p spec && jasmine && \
    zip -r -FS out/bundle.xpi \
        src/dist/ \
        LICENSE \
        README.md \
        manifest.json
