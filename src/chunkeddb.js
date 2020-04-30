// implemented according to tfjs-core/src/io/indexed_db.ts
import { ModelStoreManagerRegistry } from '@tensorflow/tfjs-core/dist/io/model_management';

import store from './store';
import load from './load';

export class ChunkedDB {

  static URL_SCHEME = 'chunkeddb://';

  constructor(modelPath) {
    if (modelPath == null || !modelPath) {
      throw new Error(
        'For IndexedDB, modelPath must not be null, undefined or empty.');
    }
    this.modelPath = modelPath;
  }

  async save(modelArtifacts) {
    return store.storeAction(modelArtifacts, this.modelPath);
  }

  async load() {
    return load.loadAction(this.modelPath);
  }

}

export const chunkedDBRouter = (url) => {
  if (!Array.isArray(url) && url.startsWith(ChunkedDB.URL_SCHEME)) {
    return new ChunkedDB(url.slice(ChunkedDB.URL_SCHEME.length));
  } else {
    return null;
  }
};
// IORouterRegistry.registerSaveRouter(chunkedDBRouter);
// IORouterRegistry.registerLoadRouter(chunkedDBRouter);
// it doesn't work. dunno why :-(

export class ChunkedDBManager {

  async listModels(){
    return new Promise(
      (resolve) => {
        resolve({}); // to be implemented
      });
  }

  async removeModel(path) {
    return new Promise((resolve) => {
      console.log('removing path', path);
      resolve(); // to be implemented
    });
  }
}

try {
  ModelStoreManagerRegistry.registerManager(
    ChunkedDB.URL_SCHEME, new ChunkedDBManager());
} catch (err) {
  //
}