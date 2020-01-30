import '@babel/polyfill';
import * as tf from '@tensorflow/tfjs';

import utils from './utils';
import rollback from './rollback.js';
import HandlerMock from './utils/HandlerMock';

// Saving in chuncks allows to store bigger models.
const MAX_CHUNCK_SIZE = 15000000; // 15mb

const DATABASE_NAME = 'tensorflowjs';
const DATABASE_VERSION = 1;
const MODEL_STORE_NAME = 'models_store';
const INFO_STORE_NAME = 'model_info_store';
const WEIGHTS_STORE_NAME = 'model_weights';

export default {
  db: null,

  // async modelToModelArtifacts(url, path) {
  //   t.db = await t._openDatabase();

  //   if (detectMocha()) {

  //   }

  //   const res = await this_save(modelArtifacts, path);

  //   return res;
  // },

  async loadAction(path) {
    this.db = await this._openDatabase();

    const idbModel = await this._loadModel(path);
    const modelArtifacts = await this._loadWeights(idbModel.modelArtifacts);
    
    const handler = new HandlerMock(modelArtifacts);
    const model = await tf.loadLayersModel(handler);
    
    this.db.close();
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
    let model;

    try {
      model = await utils.promisifyRequest(modelStore.get(path));
    } catch (error) {
      return reject(error);
    }

    if (model == null) {
      db.close();
      return reject(new Error(
        `Cannot find model with path '${Path}' ` +
        `in IndexedDB.`));
    }

    return model;
  },

  async storeAction(modelArtifacts, path) {
    this.db = await this._openDatabase();
    
    const modelArtifactsInfo = this._getModelArtifactsInfoForJSON(modelArtifacts);
    const hasWeights = modelArtifacts.weightData === null;

    await this._saveModelArtifactsInfo(path, modelArtifactsInfo);

    if (hasWeights === true) {
      modelArtifacts = this._parseModelWeights(modelArtifacts, path);
      await this._saveModelWeights(modelArtifacts, path);
    }

    await this._saveModelArtifacts(path, modelArtifacts);
    this.db.close();
    return modelArtifactsInfo;
  },

  async _saveModelArtifactsInfo(path, modelArtifactsInfo) {
    const infoTx = this.db.transaction(INFO_STORE_NAME, 'readwrite');
    const infoStore = infoTx.objectStore(INFO_STORE_NAME);

    try {
      await utils.promisifyRequest(
        infoStore.put({
          modelPath: path,
          modelArtifactsInfo
        })
      );
    } catch (error) {
      this.db.close();
      throw new Error(error);
    }
  },

  async _saveModelWeights(modelArtifacts, modelPath) {
    // handle weight data === null
    try {
      await Promise.all(chunckIds.map(async (chunckId, i) => {
        const weightTx = this.db.transaction(WEIGHTS_STORE_NAME, 'readwrite');
        const weightsStore = weightTx.objectStore(WEIGHTS_STORE_NAME);

        const start = i * MAX_CHUNCK_SIZE;
        const end = start + MAX_CHUNCK_SIZE < modelArtifacts.weightData.byteLength ? 
          start + MAX_CHUNCK_SIZE :
          modelArtifacts.weightData.byteLength;

        const weightData = modelArtifacts.weightData.slice(start, end);

        try {
          await utils.promisifyRequest(
            weightsStore.put({
              chunckId,
              weightData,
            })
          );
        } catch (err) {
          throw new Error(err);
        }
      }));
    } catch (error) {
      // If the put-model request fails, roll back the info entry as
      // well. If rollback fails, reject with error that triggered the
      // rollback initially.
      rollback.array(this.db, WEIGHTS_STORE_NAME, chunckIds).catch();
      rollback.single(this.db, INFO_STORE_NAME, modelPath).catch();
      this.db.close();
      throw new Error(error);
    }

    modelArtifacts.weightData = null;

    return modelArtifacts;
  },

  async _saveModelArtifacts(modelPath, modelArtifacts) {
    const modelTx = this.db.transaction(MODEL_STORE_NAME, 'readwrite');
    const modelStore = modelTx.objectStore(MODEL_STORE_NAME);
    try {
      await utils.promisifyRequest(
        modelStore.put({
          modelPath,
          modelArtifacts,
        })
      );
    } catch (error) {
      // If the put-model request fails, roll back the info entry as
      // well. If rollback fails, reject with error that triggered the
      // rollback initially.
      await rollback.single(this.db, INFO_STORE_NAME, this.modelPath);
      this.db.close();
      throw new Error(error);
    }
  },

  async _parseModelWeights(modelArtifacts, modelPath) {
    if (modelArtifacts.weightData === null) {
      modelArtifacts.weightChunckKeys = null;
      return modelArtifacts;
    }

    const amountOfChuncks = Math.ceil(modelArtifacts.weightData.byteLength / MAX_CHUNCK_SIZE);
    const chunckIds = Array.from(Array(amountOfChuncks).keys()).map((item, i) => {
      return `${modelPath}_${i}`;
    });

    modelArtifacts.weightChunckKeys = chunckIds;

    return modelArtifacts;
  },

  _openDatabase() {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      openRequest.onupgradeneeded = () => this._setUpDatabase(openRequest);
      openRequest.onsuccess = (res) => resolve(res.target.result);
      openRequest.onerror = (err) => reject(err);
    });
  },

  deleteDatabase() {
    const theWindow = window;
    const factory = theWindow.indexedDB || theWindow.mozIndexedDB ||
        theWindow.webkitIndexedDB || theWindow.msIndexedDB ||
        theWindow.shimIndexedDB;
    if (factory == null) {
      throw new Error(
        'The current browser does not appear to support IndexedDB.');
    }
  
    return new Promise((resolve, reject) => {
      const deleteRequest = factory.deleteDatabase(DATABASE_NAME);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = error => reject(error);

      // assumes DB gets deleted within 500ms, for test purposes;
      // setTimeout(() => {
      //   resolve();
      // }, 500)
    });
  },

  async _getModelArtifacts(url) {
    const loadHandlers = tf.io.getLoadHandlers(url);
    const modelArtifacts = await loadHandlers[0].load();

    return modelArtifacts;
  },

  _getModelArtifactsInfoForJSON(modelArtifacts) {
    if (modelArtifacts.modelTopology instanceof ArrayBuffer) {
      throw new Error('Expected JSON model topology, received ArrayBuffer.');
    }
    return {
      dateSaved: new Date(),
      modelTopologyType: 'JSON',
      modelTopologyBytes: modelArtifacts.modelTopology == null ?
        0 :
        utils.stringByteLength(JSON.stringify(modelArtifacts.modelTopology)),
      weightSpecsBytes: modelArtifacts.weightSpecs == null ?
        0 :
        utils.stringByteLength(JSON.stringify(modelArtifacts.weightSpecs)),
      weightDataBytes: modelArtifacts.weightData == null ?
        0 :
        modelArtifacts.weightData.byteLength,
    };
  },

  _setUpDatabase(openRequest) {
    const db = openRequest.result;
    db.createObjectStore(MODEL_STORE_NAME, {keyPath: 'modelPath'});
    db.createObjectStore(INFO_STORE_NAME, {keyPath: 'modelPath'});
    db.createObjectStore(WEIGHTS_STORE_NAME, {keyPath: 'chunckId'});
  },
};