/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  // The Init method is called when the Smart Contract 'dog' is instantiated by the blockchain network
  // Best practice is to have any Ledger initialization in separate function -- see initLedger()
  async Init(stub) {
    console.info('=========== Instantiated dogs chaincode ===========');
    return shim.success();
  }

  // The Invoke method is called as a result of an application request to run the Smart Contract
  // 'dog'. The calling application program has also specified the particular smart contract
  // function to be called, with arguments
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async queryDog(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting DogNumber ex: DOG01');
    }
    let dogNumber = args[0];

    let dogAsBytes = await stub.getState(dogNumber); //get the dog from chaincode state
    if (!dogAsBytes || dogAsBytes.toString().length <= 0) {
      throw new Error(dogNumber + ' does not exist: ');
    }
    console.log(dogAsBytes.toString());
    return dogAsBytes;
  }

  async initLedger(stub, args) {
    console.info('============= START : Initialize Ledger ===========');
    let dogs = [];
    dogs.push({
      breed: 'Fox Terrier',
      gender: 'female',
      name: 'Dona',
      weight: '8',
      color: 'white',
      owner: 'BREEDER0'
    });
    dogs.push({
      breed: 'Pit Bull',
      gender: 'male',
      name: 'Lora',
      weight: '18',
      color: 'black',
      owner: 'BREEDER1'
    });
    dogs.push({
      breed: 'Retriever',
      gender: 'female',
      name: 'Sena',
      weight: '12',
      color: 'yellow',
      owner: 'BREEDER2'
    });
    dogs.push({
      breed: 'Hushy',
      gender: 'male',
      name: 'Hus',
      weight: '23',
      color: 'white-black',
      owner: 'BREEDER2',
      children: ['DOG5']
    });
    dogs.push({
      breed: 'Hushy',
      gender: 'female',
      name: 'Huskina',
      weight: '20',
      color: 'white-black',
      owner: 'BREEDER2',
      children: ['DOG5']
    });
    dogs.push({
      breed: 'Hushy',
      gender: 'male',
      name: 'His',
      weight: '10',
      color: 'white-black',
      owner: 'BREEDER2',
      father: 'DOG3',
      mother: 'DOG4'
    });

    for (let i = 0; i < dogs.length; i++) {
      dogs[i].docType = 'dog';
      await stub.putState('DOG' + i, Buffer.from(JSON.stringify(dogs[i])));
      console.info('Added <--> ', dogs[i]);
    }

    let breeders = [];
    breeders.push({
      name: 'breeder Novi Sad',
      address: 'Novi Sad'
    });
    breeders.push({
      name: 'breeder Beograd',
      address: 'Beograd'
    });
    breeders.push({
      name: 'breeder Nis',
      address: 'Nis'
    });

    for (let i = 0; i < breeders.length; i++) {
      breeders[i].docType = 'dog';
      await stub.putState('BREEDER' + i, Buffer.from(JSON.stringify(breeders[i])));
      console.info('Added <--> ', breeders[i]);
    }

    console.info('============= END : Initialize Ledger ===========');
  }

  async createDog(stub, args) {
    console.info('============= START : Create Dog ===========');
    if (args.length != 7) {
      throw new Error('Incorrect number of arguments. Expecting 7');
    }

    var dog = {
      docType: 'dog',
      breed: args[1],
      gender: args[2],
      name: args[3],
      weight: args[4],
      color: args[5],
      owner: args[6]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(dog)));
    console.info('============= END : Create Dog ===========');
  }

  async queryAllDogs(stub, args) {

    let startKey = 'DOG0';
    let endKey = 'DOG99';

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }

  async queryAllBreeders(stub, args) {

    let startKey = 'BREEDER0';
    let endKey = 'BREEDER99';

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }

  async changeDogOwner(stub, args) {
    console.info('============= START : changeDogOwner ===========');
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }

    let dogAsBytes = await stub.getState(args[0]);
    let dog = JSON.parse(dogAsBytes);
    dog.owner = args[1];

    await stub.putState(args[0], Buffer.from(JSON.stringify(dog)));
    console.info('============= END : changeDogOwner ===========');
  }

  async deleteDog(stub, args) {
    console.info('============= START : deleteDog ===========');
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }

    await stub.deleteState(args[0]);
    console.info('============= END : deleteDog ===========');
  }

  async historyForDog(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }

    let iterator = await stub.getHistoryForKey(args[0]);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }

  async getQueryResult(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }

    let iterator = await stub.getQueryResult(args[0]);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }  

};

shim.start(new Chaincode());