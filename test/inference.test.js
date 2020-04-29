import '@babel/polyfill'
import * as tf from '@tensorflow/tfjs';

import indexedDbService from '../src/index';
import load from '../src/load';
import utils from '../src/utils/utils';
import store from '../src/store';
import iris from './mocks/data/iris';
import Upsampling from './mocks/Upsampling';

const IRIS_MODEL = 'https://storage.googleapis.com/tfjs-models/tfjs/iris_v1/model.json';
const DEXTR_MODEL = 'http://localhost:5000/static/models/dextr/model.json';

describe('inference', async () => {
  describe('IRIS MODEL', async () => {
    beforeEach(async function() {
      await utils.deleteDatabase();
      await tf.disposeVariables();
    });
  
    afterEach(async function() {
      await utils.deleteDatabase();
      await tf.disposeVariables();
    }); 
  
    it('does inference with server model', async () => {
      const testingData = tf.tensor2d(iris.map(item => [
        item.sepal_length, item.sepal_width, item.petal_length, item.petal_width,
      ]))
  
      const model = await tf.loadLayersModel(IRIS_MODEL);
      const pred = model.predict(testingData)
  
      model.dispose();
      pred.dispose();
      testingData.dispose();
    });
  
    it('does same inference between indexedDB and server model', async () => {
      const testingData = tf.tensor2d(iris.map(item => [
        item.sepal_length, item.sepal_width, item.petal_length, item.petal_width,
      ]));
  
      await indexedDbService.loadAndStoreLayersModel(IRIS_MODEL, 'iris');
      const idbModelArtifacts = await indexedDbService.loadFromIndexedDb('iris');
      const idbModel = await load.convertModelArtifactsToModel(idbModelArtifacts);
      
      const model = await tf.loadLayersModel(IRIS_MODEL);
  
      const pred = await model.predict(testingData).array();
      const idbPred = await idbModel.predict(testingData).array();
  
      expect(idbPred).toEqual(pred);
    });
  
    it('does same inference between server and preindexedDB (before saving) model', async () => {
      const testingData = tf.tensor2d(iris.map(item => [
        item.sepal_length, item.sepal_width, item.petal_length, item.petal_width,
      ]));
  
      const modelArtifacts = await indexedDbService.loadAndStoreLayersModel(IRIS_MODEL, 'iris');
      const model = await load.convertModelArtifactsToModel(modelArtifacts);
      
      const origModel = await tf.loadLayersModel(IRIS_MODEL);
  
      const origPred = await origModel.predict(testingData).array();
      const pred = await model.predict(testingData).array();
  
      expect(pred).toEqual(origPred);
    });
  });

  describe('DEXTR MODEL', async () => {
    beforeEach(async function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

      await utils.deleteDatabase();
      await tf.disposeVariables();
    });
  
    afterEach(async function() {
      await utils.deleteDatabase();
      await tf.disposeVariables();
    }); 
  
    it('does inference with server model', async () => {
      const inputRes = await fetch('./base/test/mocks/data/dextrInput.json');
      const inputJson = await inputRes.json();
      const inputTensor = await tf.tensor(inputJson.input);

      tf.serialization.registerClass(Upsampling);
      const model = await tf.loadLayersModel(DEXTR_MODEL);
      await model.predict(inputTensor)
    });

    it('does inference with indexedDB model', async () => {
      // Test can be a bit buggy, if fails retry with some refreshs.
      const inputRes = await fetch('./base/test/mocks/data/dextrInput.json');
      const inputJson = await inputRes.json();
      const inputTensor = await tf.tensor(inputJson.input);
      
      const artifacts = await store.convertUrlToArtifacts(DEXTR_MODEL);
      await store.storeAction(artifacts, 'dextr');
      
      tf.serialization.registerClass(Upsampling);
      const idbModelArtifacts = await indexedDbService.loadFromIndexedDb('dextr');
      const idbModel = await load.convertModelArtifactsToModel(idbModelArtifacts);

      const pred = await idbModel.predict(inputTensor);
      expect(pred.shape).toEqual([1, 512, 512, 1]);
    });
  });
});