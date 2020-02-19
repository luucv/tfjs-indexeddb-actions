
import '@babel/polyfill';
import * as tf from '@tensorflow/tfjs';

import { MODEL_STORE_NAME, WEIGHTS_STORE_NAME } from './globals';
import utils from './utils/utils';
import HandlerMock from './utils/HandlerMock';

// Saving in chuncks allows to store bigger models.
export default {
  db: null,

  async loadAction(path) {
    // this.db = await utils.openDatabase();
    const idbModel = await this._loadModel(path);
    const modelArtifacts = await this._loadWeights(idbModel.modelArtifacts);
    
    this.db.close();
    return modelArtifacts;
  },

  async getModelWeights(key) {
    const db = await utils.openDatabase();
    const modelTx = db.transaction(WEIGHTS_STORE_NAME, 'readonly');
    const modelStore = modelTx.objectStore(WEIGHTS_STORE_NAME);
    const modelWeights = await utils.promisifyRequest(modelStore.get(key));
    db.close();
    console.log('yala', modelWeights.blob);
    window.location.href = window.URL.createObjectURL(modelWeights.blob);

    // window.location.href = modelWeights.blob;
    return modelWeights;
  },

  async getModelInfo(key) {
    const db = await utils.openDatabase();
    const modelTx = db.transaction(WEIGHTS_STORE_NAME, 'readonly');
    const modelStore = modelTx.objectStore(WEIGHTS_STORE_NAME);
    const modelWeights = await utils.promisifyRequest(modelStore.get(key));
    db.close();
    console.log('yala', modelWeights.blob);
    window.location.href = window.URL.createObjectURL(modelWeights.blob);

    // window.location.href = modelWeights.blob;
    return modelWeights;
  },

  async convertModelArtifactsToModel(modelArtifacts) {
    const handler = new HandlerMock(modelArtifacts);
    const model = await tf.loadLayersModel(handler);

    return model;
  },

  async _loadWeights(artifacts) {
    const modelArtifacts = artifacts;

    if (modelArtifacts.weightChunckKeys === 'undefined') {
      const weightDataChuncked = await Promise.all(modelArtifacts.weightChunckKeys.map(async (chunckKey) => {
        const weightTx = this.db.transaction(WEIGHTS_STORE_NAME, 'readwrite');
        const weightsStore = weightTx.objectStore(WEIGHTS_STORE_NAME);
        const weightDataChunck = await utils.promisifyRequest(weightsStore.get(chunckKey));
        return weightDataChunck.weightData;
      }));

      const weightData = utils.concatenateArrayBuffers(weightDataChuncked);
      modelArtifacts.weightData = weightData;
    }

    return artifacts;
  },

  async _loadModel(path) {
    const modelTx = this.db.transaction(MODEL_STORE_NAME, 'readonly');
    const modelStore = modelTx.objectStore(MODEL_STORE_NAME);
    const model = await utils.promisifyRequest(modelStore.get(path));

    if (model == null) {
      
      this.db.close();
      const error = new Error(
        `Cannot find model with path '${path}' ` +
        'in IndexedDB.');
      error.code = 404;
      throw error;
    }

    return model;
  },

  async _getModelArtifacts(url) {
    const loadHandlers = tf.io.getLoadHandlers(url);
    const modelArtifacts = await loadHandlers[0].load();

    return modelArtifacts;
  },

  async _loadFromFiles() {
    const jsonUpload = document.getElementById('json-upload');
    const weightsUpload = document.getElementById('weights-upload');

    const model = await tf.loadLayersModel(
      tf.io.browserFiles([jsonUpload.files[0], weightsUpload.files[0]]));
    }
};