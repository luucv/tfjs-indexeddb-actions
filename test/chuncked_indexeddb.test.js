import '@babel/polyfill'
import * as tf from '@tensorflow/tfjs';

import { indexedDBRouter } from '../src/chunked_indexeddb.js';
import load from '../src/load';
import utils from '../src/utils/utils';
import { artifacts } from './mocks/model';
import Upsampling from './mocks/Upsampling';

describe('ChunckedIndexedDB', async () => {
  beforeEach(async function() {
    await utils.deleteDatabase();
  });

  afterEach(async function() {
    await utils.deleteDatabase();
  });

  it('returns indexedDB retreiver based on url path', async () => {
    const handler = indexedDBRouter('chunked-indexeddb://foo');
    expect(handler.URL_SCHEME).to.equal('chunked-indexeddb://');
  });

  it('roundtrip small model', async () => {
    tf.serialization.registerClass(Upsampling);

    const modelHandler = indexedDBRouter('chunked-indexeddb://foo');
    await modelHandler.save(artifacts);

    const modelArtifacts = await modelHandler.load();
    const model = await load.convertModelArtifactsToModel(modelArtifacts);

    expect(model.name).toEqual('sequential_1');
  });
});
