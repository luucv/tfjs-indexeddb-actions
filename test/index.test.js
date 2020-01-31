import '@babel/polyfill'
import * as tf from '@tensorflow/tfjs';

import load from '../src/load';
import store from '../src/store';
import utils from '../src/utils/utils';
import { artifacts } from './mocks/model';
import Upsampling from './mocks/Upsampling';

const BIG_MODEL_URL = 'http://localhost:5000/static/models/dextr/model.json';

describe('functional', async () => {
  beforeEach(async function() {
    await utils.deleteDatabase();
  });

  afterEach(async function() {
    await utils.deleteDatabase();
  });

  it('roundtrip small model', async () => {
    await store.storeAction(artifacts, 'foo');
    const model = await load.loadAction('foo');

    expect(model.name).toEqual('sequential_1');
  });

  it('roundtrip big model', async () => {
    // load customlayers
    tf.serialization.registerClass(Upsampling);

    const artifacts = await store.convertUrlToArtifacts(BIG_MODEL_URL);
    await store.storeAction(artifacts, 'foo');
    const model = await load.loadAction('foo');

    expect(model).not.toEqual(null);
    expect(model.layers.length).toEqual(372);
  });
});