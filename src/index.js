import '@babel/polyfill';

import utils, { stringByteLength } from './utils';
// import detectMocha from 'detect-mocha';
import rollback from './rollback.js';

const DATABASE_NAME = 'tensorflowjs';
const DATABASE_VERSION = 1;

// Saving in chuncks allows to store bigger models.
const MAX_CHUNCK_SIZE = 15000000; // 15mb

const MODEL_STORE_NAME = 'models_store';
const INFO_STORE_NAME = 'model_info_store';
const WEIGHTS_STORE_NAME = 'model_weights';


const handler = {
  db: null,

  loadAction(path) {

  },

  // async modelToModelArtifacts(url, path) {
  //   t.db = await t._openDatabase();

  //   if (detectMocha()) {

  //   }

  //   const res = await this_save(modelArtifacts, path);

  //   return res;
  // },

  async storeAction(modelArtifacts, path) {
    handler.db = await handler._openDatabase();
    console.log('openeddb...')
    
    const modelArtifactsInfo = handler._getModelArtifactsInfoForJSON(modelArtifacts);
    const hasWeights = modelArtifacts.weightData === null;

    console.log('first...')
    await handler._saveModelArtifactsInfo(path, modelArtifactsInfo);

    if (hasWeights === true) {
      console.log('second...')
      modelArtifacts = handler._parseModelWeights(modelArtifacts, path);
      await handler._saveModelWeights(modelArtifacts, path);
    }

    await handler._saveModelArtifacts(path, modelArtifacts);

    return modelArtifactsInfo;
  },

  async _saveModelArtifactsInfo(path, modelArtifactsInfo) {
    console.log(handler.db);
    const infoTx = handler.db.transaction(INFO_STORE_NAME, 'readwrite');
    const infoStore = infoTx.objectStore(INFO_STORE_NAME);

    try {
      await utils.promisifyRequest(
        infoStore.put({
          modelPath: path,
          modelArtifactsInfo
        })
      );
    } catch (error) {
      handler.db.close();
      throw new Error(error);
    }
  },

  async _saveModelWeights(modelArtifacts, modelPath) {
    // handle weight data === null
    try {
      await Promise.all(chunckIds.map(async (chunckId, i) => {
        const weightTx = handler.db.transaction(WEIGHTS_STORE_NAME, 'readwrite');
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
      rollback.array(handler.db, WEIGHTS_STORE_NAME, chunckIds).catch();
      rollback.single(handler.db, INFO_STORE_NAME, modelPath).catch();
      handler.db.close();
      throw new Error(error);
    }

    modelArtifacts.weightData = null;

    return modelArtifacts;
  },

  async _saveModelArtifacts(modelPath, modelArtifacts) {
    const modelTx = handler.db.transaction(MODEL_STORE_NAME, 'readwrite');
    const modelStore = modelTx.objectStore(MODEL_STORE_NAME);
    console.log('modelStore', modelStore);
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
      console.log('error', error);
      await rollback.single(handler.db, INFO_STORE_NAME, handler.modelPath);
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
      openRequest.onupgradeneeded = () => handler._setUpDatabase(openRequest);
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
        stringByteLength(JSON.stringify(modelArtifacts.modelTopology)),
      weightSpecsBytes: modelArtifacts.weightSpecs == null ?
        0 :
        stringByteLength(JSON.stringify(modelArtifacts.weightSpecs)),
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

export default handler;
