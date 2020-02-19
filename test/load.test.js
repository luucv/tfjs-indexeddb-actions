import '@babel/polyfill'

import load from '../src/load';
import store from '../src/store';

import utils from '../src/utils/utils';
import { MODEL_STORE_NAME, INFO_STORE_NAME, WEIGHTS_STORE_NAME } from '../src/globals';

const BIG_MODEL_URL = 'http://localhost:5000/static/models/dextr/model.json';

describe('load', async () => {
  beforeEach(async function() {
    await utils.deleteDatabase();
  });

  afterEach(async function() {
    await utils.deleteDatabase();
  });

  // it('throws 404 when model does not found', async () => {
  //   let error, model = null;
  //   try {
  //     model = await load.loadAction('foo', null);
  //   } catch(err) {
  //     error = err;
  //   }

  //   expect(error).not.toEqual(null);
  //   expect(error.code).toEqual(404);
  //   expect(model).toEqual(null);
  // });

  // it('retreives big weights from indexeddb', async () => {
  //   const blobs = await store.convertUrlToBlobs(BIG_MODEL_URL)
  //   await store.saveModelWeights(blobs.weightsURL, 'foo');

  //   const db = await utils.openDatabase();
  //   const modelTx = db.transaction(WEIGHTS_STORE_NAME, 'readonly');
  //   const modelStore = modelTx.objectStore(WEIGHTS_STORE_NAME);
  //   const modelWeights = await utils.promisifyRequest(modelStore.get('foo'));
  //   db.close();

  //   expect(modelWeights.blob).toEqual(blobs.weightsURL);

  //   const weightBlob = await load.getModelWeights('foo');
  // });
});