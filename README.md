## Breeder Network

Before we begin, if you haven’t already done so, you may wish to check that you have all the <a href="http://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html">Prerequisites</a> installed on the platform(s) on which you’ll be developing blockchain applications and/or operating Hyperledger Fabric.

You will also need to Install <a href="http://hyperledger-fabric.readthedocs.io/en/latest/install.html">Binaries and Images</a>. You are not going to need fabric samples, but they are downloaded together with Binaries and Images. Don't forget to add bin folder to your PATH environment variable.

./startNetwork.sh -m up -l node

sh stopNetwork.sh

node enrollAdmin.js<br>
node registerUser.js<br>
node initDogs.js<br>
note getAllDogs.js<br>
...


http://localhost:5984/_utils/#database/mychannel_mycc/_all_docs     -CouchDB GUI