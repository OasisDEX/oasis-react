#!/bin/bash

if [ "$TRAVIS_BRANCH" == "" ]; then
    git rev-parse --abbrev-ref HEAD
else
    echo $TRAVIS_BRANCH
fi