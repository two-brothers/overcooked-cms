#!/usr/bin/env bash

npm run build
scp -r build/* nnazareth_overcooked@ssh.phx.nearlyfreespeech.net:/home/protected/overcooked-api/static/