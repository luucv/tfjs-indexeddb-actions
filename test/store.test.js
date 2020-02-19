import '@babel/polyfill'
import * as tf from '@tensorflow/tfjs';

import load from '../src/load';
import store from '../src/store';
import utils from '../src/utils/utils';
import { MODEL_STORE_NAME, INFO_STORE_NAME, WEIGHTS_STORE_NAME } from '../src/globals';
import { artifacts } from './mocks/model';

const BIG_MODEL_URL = 'http://localhost:5000/static/models/dextr/model.json';
const IRIS_MODEL = 'https://storage.googleapis.com/tfjs-models/tfjs/iris_v1/model.json';

describe('store', async () => {
  beforeEach(async function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;
    await utils.deleteDatabase(); 
  });

  // afterEach(async function() {
  //   await utils.deleteDatabase();
  // });

  // it('stores simple model', async () => {
  //   await store.storeAction(artifacts, 'foo');

  //   const db = await utils.openDatabase();
  //   const modelTx = db.transaction(MODEL_STORE_NAME, 'readonly');
  //   const modelStore = modelTx.objectStore(MODEL_STORE_NAME);
  //   const model = await utils.promisifyRequest(modelStore.get('foo'));
  //   db.close();

  //   expect(model).not.toEqual(null);
  //   expect(model.modelArtifacts.modelTopology).toEqual(artifacts.modelTopology);
  // });

  // it('converts small model to blobs', async () => {
  //   const blobs = await store.convertUrlToBlobs(IRIS_MODEL)
  //   expect(blobs.modelTopologyAndWeightManifestURL).not.toEqual(undefined);
  //   expect(blobs.weightsURL).not.toEqual(undefined);

  //   // expect(model.modelArtifacts.modelTopology).toEqual(artifacts.modelTopology);
  // });

  // it('saves small modelinfo to indexeddb', async () => {
  //   const blobs = await store.convertUrlToBlobs(IRIS_MODEL)
  //   await store.saveModelArtifactsInfo(blobs.modelTopologyAndWeightManifestURL, 'foo');

  //   const db = await utils.openDatabase();
  //   const modelTx = db.transaction(INFO_STORE_NAME, 'readonly');
  //   const modelStore = modelTx.objectStore(INFO_STORE_NAME);
  //   const modelInfo = await utils.promisifyRequest(modelStore.get('foo'));
  //   db.close();

  //   expect(modelInfo.blob).toEqual(blobs.modelTopologyAndWeightManifestURL);
  // });

  // it('saves small weights to indexeddb', async () => {
  //   const blobs = await store.convertUrlToBlobs(IRIS_MODEL)
  //   await store.saveModelWeights(blobs.weightsURL, 'foo');

  //   const db = await utils.openDatabase();
  //   const modelTx = db.transaction(WEIGHTS_STORE_NAME, 'readonly');
  //   const modelStore = modelTx.objectStore(WEIGHTS_STORE_NAME);
  //   const modelWeights = await utils.promisifyRequest(modelStore.get('foo'));
  //   db.close();

  //   expect(modelWeights.blob).toEqual(blobs.weightsURL);
  // });

  // it('converts big model to blobs', async () => {
  //   const blobs = await store.convertUrlToBlobs(BIG_MODEL_URL)
  //   expect(blobs.modelTopologyAndWeightManifestURL).not.toEqual(undefined);
  //   expect(blobs.weightsURL).not.toEqual(undefined);

  //   // expect(model.modelArtifacts.modelTopology).toEqual(artifacts.modelTopology);
  // });

  // it('saves big modelinfo to indexeddb', async () => {
  //   const blobs = await store.convertUrlToBlobs(BIG_MODEL_URL)
  //   await store.saveModelArtifactsInfo(blobs.modelTopologyAndWeightManifestURL, 'foo');

  //   const db = await utils.openDatabase();
  //   const modelTx = db.transaction(INFO_STORE_NAME, 'readonly');
  //   const modelStore = modelTx.objectStore(INFO_STORE_NAME);
  //   const modelInfo = await utils.promisifyRequest(modelStore.get('foo'));
  //   db.close();

  //   expect(modelInfo.blob).toEqual(blobs.modelTopologyAndWeightManifestURL);
  // });

  it('saves big weights to indexeddb', async () => {
    const arrayBuffers = await store.convertUrlToArrayBuffers(BIG_MODEL_URL)
    await store.saveModelWeights(arrayBuffers.weights, 'foo');
    console.log('hier')
    const db = await utils.openDatabase();
    console.log('hier3')

    const modelTx = db.transaction(WEIGHTS_STORE_NAME, 'readonly');
    console.log('hier4')

    const modelStore = modelTx.objectStore(WEIGHTS_STORE_NAME);
    console.log('hier5')

    const modelWeights1 = await utils.promisifyRequest(modelStore.get('foo_1'));
    const modelWeights2 = await utils.promisifyRequest(modelStore.get('foo_2'));
    const modelWeights3 = await utils.promisifyRequest(modelStore.get('foo_3'));
    const modelWeights4 = await utils.promisifyRequest(modelStore.get('foo_4'));
    console.log('hier7')

    db.close();
    console.log('hier8', modelWeights1, modelWeights2, modelWeights3, modelWeights4)


    const modelWeights = await utils.concatenateArrayBuffers([
      modelWeights1.arrayBuffer, 
      modelWeights2.arrayBuffer,
      modelWeights3.arrayBuffer,
      modelWeights4.arrayBuffer 
    ]);

    expect(modelWeights).toEqual(arrayBuffers.weights);

    const WeightsBlob = utils.arrayBufferToBlob(modelWeights, 'application/octet-stream')

    
  });

  // it('stores big model', async () => {
  //   const artifacts = await store.convertUrlToArtifacts(BIG_MODEL_URL);
  //   await store.storeAction(artifacts, 'foo');

  //   const db = await utils.openDatabase();
  //   const modelTx = db.transaction(MODEL_STORE_NAME, 'readonly');
  //   const modelStore = modelTx.objectStore(MODEL_STORE_NAME);
  //   const model = await utils.promisifyRequest(modelStore.get('foo'));

  //   const weightTx = db.transaction(WEIGHTS_STORE_NAME, 'readonly');
  //   const weightStore = weightTx.objectStore(WEIGHTS_STORE_NAME);
  //   const weigts1 = await utils.promisifyRequest(weightStore.get('foo_0'));
  //   db.close();

  //   expect(model).not.toEqual(null);
  //   expect(model.modelArtifacts.modelTopology).toEqual(artifacts.modelTopology);
  //   expect(weigts1).not.toEqual(null);
  // });

  // it('gets artifacts from url', async () => {
  //   const artifacts = await store.convertUrlToArtifacts(BIG_MODEL_URL);
  //   expect(artifacts).not.toEqual(null);
  // });
});