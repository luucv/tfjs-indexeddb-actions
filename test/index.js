import '@babel/polyfill'
import * as tf from '@tensorflow/tfjs';

import load from '../src/load';
import store from '../src/store';
import utils from '../src/utils/utils';
import { MODEL_STORE_NAME, WEIGHTS_STORE_NAME } from '../src/globals';
import { artifacts } from './mocks/model';
import Upsampling from './mocks/Upsampling';

const BIG_MODEL_URL = 'http://localhost:5000/static/models/dextr/model.json';

describe('tfjs-indexeddb-actions', async () => {
  describe(('simple-model'), async () => {
    beforeEach(async function() {
      await utils.deleteDatabase();
    });
  
    afterEach(async function() {
      await utils.deleteDatabase();
    });

    it('saves', async () => {
      await store.storeAction(artifacts, 'foo');

      const db = await utils.openDatabase();
      const modelTx = db.transaction(MODEL_STORE_NAME, 'readonly');
      const modelStore = modelTx.objectStore(MODEL_STORE_NAME);
      const model = await utils.promisifyRequest(modelStore.get('foo'));
      db.close();

      expect(model).not.toEqual(null);
      expect(model.modelArtifacts.modelTopology).toEqual(artifacts.modelTopology);
    });
  
    it('roundtrip', async () => {
      await store.storeAction(artifacts, 'foo');
      const model = await load.loadAction('foo');
  
      expect(model.name).toEqual('sequential_1');
    });
  })

  // take a bit longer
  describe(('big-model (requires server)'), async () => {
    beforeEach(async function() {
      await utils.deleteDatabase();
    });
  
    afterEach(async function() {
      await utils.deleteDatabase();
    });

    it('gets artifacts from url', async () => {
      const artifacts = await store.convertUrlToArtifacts(BIG_MODEL_URL);
      expect(artifacts).not.toEqual(null);
    });

    it('saves', async () => {
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

    it('roundtrip', async () => {
      // load customlayers
      tf.serialization.registerClass(Upsampling);

      const artifacts = await store.convertUrlToArtifacts(BIG_MODEL_URL);
      await store.storeAction(artifacts, 'foo');
      const model = await load.loadAction('foo');

      expect(model).not.toEqual(null);
      expect(model.layers.length).toEqual(372);
    });
  });
});