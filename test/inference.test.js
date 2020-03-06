import '@babel/polyfill'
import * as tf from '@tensorflow/tfjs';

import indexedDbService from '../src/index';
import load from '../src/load';
import store from '../src/store';
import utils from '../src/utils/utils';
import { artifacts } from './mocks/model';
import Upsampling from './mocks/Upsampling';
import iris from './mocks/iris';

const BIG_MODEL_URL = 'http://localhost:5000/static/models/dextr/model.json';
const IRIS_MODEL = 'https://storage.googleapis.com/tfjs-models/tfjs/iris_v1/model.json';

describe('functional', async () => {
  beforeEach(async function() {
    await utils.deleteDatabase();
  });

  afterEach(async function() {
    await utils.deleteDatabase();
  });

  it('does inference with original IrisModel', async () => {
    const testingData = tf.tensor2d(iris.map(item => [
      item.sepal_length, item.sepal_width, item.petal_length, item.petal_width,
    ]))

    const model = await tf.loadLayersModel(IRIS_MODEL);
    const pred = model.predict(testingData)

    pred.print();

    model.dispose();
    pred.dispose();
    testingData.dispose();
  });
  it('does inference with indexedDB IrisModel', async () => {
    const testingData = tf.tensor2d(iris.map(item => [
      item.sepal_length, item.sepal_width, item.petal_length, item.petal_width,
    ]))

    await indexedDbService.loadAndStoreLayersModel(IRIS_MODEL, 'iris');
    const idbModelArtifacts = await indexedDbService.loadFromIndexedDb('iris');
    const idbModel = await load.convertModelArtifactsToModel(idbModelArtifacts);
    const model = await tf.loadLayersModel(IRIS_MODEL);

    expect(idbModel).not.toEqual(null);
    expect(idbModel.name).toEqual(model.name);

    const pred = await model.predict(testingData);
    const idbPred = await idbModel.predict(testingData);

    pred.print();
    idbPred.print();
    expect(pred).toEqual(idbPred);
  });
});