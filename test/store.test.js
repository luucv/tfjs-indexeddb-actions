import '@babel/polyfill'
import * as tf from '@tensorflow/tfjs';

import load from '../src/load';
import store from '../src/store';
import utils from '../src/utils/utils';
import { MODEL_STORE_NAME, WEIGHTS_STORE_NAME } from '../src/globals';
import { artifacts } from './mocks/model';

const BIG_MODEL_URL = 'http://localhost:5000/static/models/dextr/model.json';

describe('store', async () => {
  beforeEach(async function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
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
    const artifacts = await store.convertUrlToArtifacts(BIG_MODEL_URL);
    await store.storeAction(artifacts, 'foo');

    const db = await utils.openDatabase();
    const modelTx = db.transaction(MODEL_STORE_NAME, 'readonly');
    const modelStore = modelTx.objectStore(MODEL_STORE_NAME);
    const model = await utils.promisifyRequest(modelStore.get('foo'));

    const weightTx = db.transaction(WEIGHTS_STORE_NAME, 'readonly');
    const weightStore = weightTx.objectStore(WEIGHTS_STORE_NAME);
    const weigts1 = await utils.promisifyRequest(weightStore.get('foo_0'));
    db.close();

    expect(model).not.toEqual(null);
    expect(model.modelArtifacts.modelTopology).toEqual(artifacts.modelTopology);
    expect(weigts1).not.toEqual(null);
  });

  it('gets artifacts from url', async () => {
    const artifacts = await store.convertUrlToArtifacts(BIG_MODEL_URL);
    expect(artifacts).not.toEqual(null);
  });
});