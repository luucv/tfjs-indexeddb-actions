import '@babel/polyfill'
import * as tf from '@tensorflow/tfjs';

import indexedDbService from '../src/index';
import load from '../src/load';
import store from '../src/store';
import utils from '../src/utils/utils';
import { artifacts } from './mocks/model';
import Upsampling from './mocks/Upsampling';

const BIG_MODEL_URL = 'http://localhost:5000/static/models/dextr/model.json';
const IRIS_MODEL = 'https://storage.googleapis.com/tfjs-models/tfjs/iris_v1/model.json';

describe('functional', async () => {
  beforeEach(async function() {
    await utils.deleteDatabase();
  });

  afterEach(async function() {
    await utils.deleteDatabase();
  });

  it('roundtrip small model', async () => {
    tf.serialization.registerClass(Upsampling);
    await store.storeAction(artifacts, 'foo');
    const modelArtifacts = await load.loadAction('foo');
    const model = await load.convertModelArtifactsToModel(modelArtifacts);

    expect(model.name).toEqual('sequential_1');
  });

  it('roundtrip big model', async () => {
    tf.serialization.registerClass(Upsampling);
    const artifacts = await store.convertUrlToArtifacts(BIG_MODEL_URL);
    await store.storeAction(artifacts, 'foo');
    const modelArtifacts = await load.loadAction('foo');
    const model = await load.convertModelArtifactsToModel(modelArtifacts);

    expect(model).not.toEqual(null);
    expect(model.layers.length).toEqual(372);
  });

  it('loads and stores a model', async () => {
    const model = await indexedDbService.loadAndStoreLayersModel(IRIS_MODEL, 'iris');
    expect(model).not.toEqual(null);
  });

  it('loads from indexedDB', async () => {
    const modelArtifacts = await indexedDbService.loadAndStoreLayersModel(IRIS_MODEL, 'iris');
    const idbModelArtifacts = await indexedDbService.loadFromIndexedDb('iris');
    const model = await load.convertModelArtifactsToModel(modelArtifacts);
    const idbModel = await load.convertModelArtifactsToModel(idbModelArtifacts);

    expect(idbModel).not.toEqual(null);
    expect(idbModel.name).toEqual(model.name);
  });
});