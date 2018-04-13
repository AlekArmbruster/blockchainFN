#!/bin/bash

./startNetwork.sh -m down
docker network prune
./startNetwork.sh -m down

# delete previous creds
rm -rf hfc-key-store