import '@babel/polyfill'
import * as tf from '@tensorflow/tfjs';

import load from '../src/load';
import store from '../src/store';
import utils from '../src/utils/utils';
import { MODEL_STORE_NAME, WEIGHTS_STORE_NAME } from '../src/globals';
import { artifacts } from './mocks/model';

const BIG_MODEL_URL = 'http://localhost:5000/static/models/dextr/model.json';
const MAX_CHUNCK_SIZE = 50000000;

const compareArrayBuffer = (origin, loaded, offset) => {
  for (let i = 0; i < MAX_CHUNCK_SIZE; i++) {
    if (origin.getInt8(i + offset) !== loaded.getInt8(i)) {
      throw new Error(`arraybuffers mismatch on ${i}`);
    }
  }
}

describe('store', async () => {
  beforeEach(async function() {
    await utils.deleteDatabase();
  });

  afterEach(async function() {
    await utils.deleteDatabase();
  });

  it('stores simple model', async () => {
    await store.storeAction(artifacts, 'foo');

    const db = await utils.openDatabase();
    const modelTx = db.transaction(MODEL_STORE_NAME, 'readonly');
    const modelStore = modelTx.objectStore(MODEL_STORE_NAME);
    const model = await utils.promisifyRequest(modelStore.get('foo'));
    db.close();

    expect(model).not.toEqual(null);
    expect(model.modelArtifacts.modelTopology).toEqual(artifacts.modelTopology);
  });

  it('stores big model', async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    
    const artifacts = await store.convertUrlToArtifacts(BIG_MODEL_URL);

    const weightData = artifacts.weightData;
    
    expect(weightData).not.toEqual(null);

    await store.storeAction(artifacts, 'foo');

    const db = await utils.openDatabase();
    const modelTx = db.transaction(MODEL_STORE_NAME, 'readonly');
    const modelStore = modelTx.objectStore(MODEL_STORE_NAME);
    const model = await utils.promisifyRequest(modelStore.get('foo'));

    const weightTx = db.transaction(WEIGHTS_STORE_NAME, 'readonly');
    const weightStore = weightTx.objectStore(WEIGHTS_STORE_NAME);
    const weights1 = await utils.promisifyRequest(weightStore.get('foo_0'));
    const weights2 = await utils.promisifyRequest(weightStore.get('foo_1'));
    const weights3 = await utils.promisifyRequest(weightStore.get('foo_2'));
    const weights4 = await utils.promisifyRequest(weightStore.get('foo_3'));

    db.close(); 

    const weights = utils.concatenateArrayBuffers([
      weights1.weightData, 
      weights2.weightData, 
      weights3.weightData, 
      weights4.weightData
    ]); 

    expect(weights.byteLength).toEqual(weightData.byteLength)

    const originData = new DataView(weightData); 
    let offset = 0;
    let loadedData = new DataView(weights1.weightData);

    for (let i = 0; i < MAX_CHUNCK_SIZE; i++) {
      if (originData.getInt8(i) !== loadedData.getInt8(i)) {
        throw new Error(`arraybuffers mismatch on ${i}`);
      }
    }

    offset = MAX_CHUNCK_SIZE;
    loadedData = new DataView(weights2.weightData);

    for (let i = 0; i < MAX_CHUNCK_SIZE; i++) {
      if (originData.getInt8(i + offset) !== loadedData.getInt8(i)) {
        throw new Error(`arraybuffers mismatch on ${i}`);
      }
    }

    offset = MAX_CHUNCK_SIZE * 2;
    loadedData = new DataView(weights3.weightData);

    for (let i = 0; i < MAX_CHUNCK_SIZE; i++) {
      if (originData.getInt8(i + offset) !== loadedData.getInt8(i)) {
        throw new Error(`arraybuffers mismatch on ${i}`);
      }
    }

    offset = MAX_CHUNCK_SIZE * 3;
    loadedData = new DataView(weights4.weightData);

    for (let i = 0; i < Math.min(weights4.byteLength, MAX_CHUNCK_SIZE); i++) {
      if (originData.getInt8(i + offset) !== loadedData.getInt8(i)) {
        throw new Error(`arraybuffers mismatch on ${i}`);
      }
    }
    console.log(artifacts);

    expect(model.modelArtifacts.modelTopology).toEqual(artifacts.modelTopology);
    expect(weights1.weightData).toEqual(weightData.slice(0, MAX_CHUNCK_SIZE));
    expect(model).not.toEqual(null);
    expect(model.modelArtifacts.modelTopology).toEqual(artifacts.modelTopology);
    expect(weights1).not.toEqual(null);
  });

  // it('gets artifacts from url', async () => {
  //   const artifacts = await store.convertUrlToArtifacts(BIG_MODEL_URL);
  //   expect(artifacts).not.toEqual(null);
  // });
});