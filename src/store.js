import '@babel/polyfill';
import * as tf from '@tensorflow/tfjs';
import { MODEL_STORE_NAME, INFO_STORE_NAME, WEIGHTS_STORE_NAME } from './globals';
import utils from './utils/utils';
import rollback from './utils/rollback.js';

// Saving in chuncks allows to store bigger models.
const MAX_CHUNCK_SIZE = 15000000; // 15mb

export default {
  db: null,

  async convertUrlToArtifacts(url) {
    const loadHandlers = tf.io.getLoadHandlers(url);
    const modelArtifacts = await loadHandlers[0].load();

    return modelArtifacts;
  },

  async storeAction(modelArtifacts, path) {
    this.db = await utils.openDatabase();
    
    const modelArtifactsInfo = this._getModelArtifactsInfoForJSON(modelArtifacts);
    const hasWeights = modelArtifacts.weightData !== null;
    await this._saveModelArtifactsInfo(path, modelArtifactsInfo);

    if (hasWeights === true) {
      modelArtifacts = await this._parseModelWeights(modelArtifacts, path);
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
    const chunckIds = modelArtifacts.weightChunckKeys;
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
      // eslint-disable-next-line no-unused-vars
      rollback.array(this.db, WEIGHTS_STORE_NAME, chunckIds).catch((err) => {});
      // eslint-disable-next-line no-unused-vars
      rollback.single(this.db, INFO_STORE_NAME, modelPath).catch((err) => {});
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

  async _getModelArtifacts(url) {
    const loadHandlers = tf.io.getLoadHandlers(url);
    const modelArtifacts = await loadHandlers[0].load();

    return modelArtifacts;
  },

  _getModelArtifactsInfoForJSON(modelArtifacts) {
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
};