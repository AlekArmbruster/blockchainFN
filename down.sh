#!/bin/bash

./byfn.sh -m down
docker network prune
./byfn.sh -m down

# delete previous creds
rm -rf hfc-key-store