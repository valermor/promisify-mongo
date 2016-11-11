#!/usr/bin/env bash

# launches mongo and exposes port 3000 to the host
docker run -p 3000:27017  --name mongo-database -d mongo