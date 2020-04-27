import '@babel/polyfill'
import * as tf from '@tensorflow/tfjs';

import { chunkedDBRouter } from '../src/chunkeddb.js';
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
    const handler = chunkedDBRouter('chunkeddb://foo');
    expect(handler.modelPath).toEqual('foo');
  });

  it('returns null if path not chunkeddb://', async () => {
    const modelHandler = chunkedDBRouter('foo');
    expect(modelHandler).toEqual(null);
  });

  it('roundtrip small model', async () => {
    tf.serialization.registerClass(Upsampling);

    const modelHandler = chunkedDBRouter('chunkeddb://foo');
    await modelHandler.save(artifacts);

    const modelArtifacts = await modelHandler.load();
    const model = await load.convertModelArtifactsToModel(modelArtifacts);
    
    expect(model.name).toEqual('sequential_1');
  });
});
