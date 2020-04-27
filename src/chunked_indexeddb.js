import { IORouterRegistry } from '@tensorflow/tfjs-core/src/io/router_registry.ts';
import { ModelStoreManagerRegistry } from '@tensorflow/tfjs-core/src/io/model_management.ts';

import store from './store';
import load from './load';

export class ChunkedIndexedDB {
  constructor(modelPath) {
    if (modelPath == null || !modelPath) {
      throw new Error(
        'For IndexedDB, modelPath must not be null, undefined or empty.');
    }
    this.modelPath = modelPath;
    this.URL_SCHEME = 'chunked-indexeddb://';
  }

  async save(modelArtifacts) {
    return store.storeAction(modelArtifacts, this.modelPath);
  }

  async load() {
    return load.loadAction(this.modelPath);
  }
}

export const indexedDBRouter = (url) => {
  // if (!env().getBool('IS_BROWSER')) return null;

  if (!Array.isArray(url) && url.startsWith(ChunkedIndexedDB.URL_SCHEME)) {
    return new ChunkedIndexedDB(url.slice(ChunkedIndexedDB.URL_SCHEME.length));
  } else {
    return null;
  }
};

IORouterRegistry.registerSaveRouter(indexedDBRouter);
IORouterRegistry.registerLoadRouter(indexedDBRouter);

export class ChunkedIndexedDBManager {
  async listModels() {
    return new Promise(
        (resolve, reject) => {
          resolve({}); // to be implemented
        });
  }

  async removeModel(path) {
    return new Promise((resolve, reject) => {
      resolve(); // to be implemented
    });
  }
}

try {
  ModelStoreManagerRegistry.registerManager(
    ChunkedIndexedDB.URL_SCHEME, new ChunkedIndexedDBManager());
} catch (err) {
}