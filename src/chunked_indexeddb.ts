import {IOHandler, ModelArtifacts, ModelArtifactsInfo, ModelStoreManager, SaveResult} from '@tensorflow/tfjs-core/src/io/types';
import {IORouter, IORouterRegistry} from '@tensorflow/tfjs-core/src/io/router_registry';
import {ModelStoreManagerRegistry} from '@tensorflow/tfjs-core/src/io/model_management';

import store from './store';
import load from './load';

export class ChunkedIndexedDB implements IOHandler {
  protected readonly modelPath: string;

  static readonly URL_SCHEME = 'chunked-indexeddb://';

  constructor(modelPath: string) {
    if (modelPath == null || !modelPath) {
      throw new Error(
          'For IndexedDB, modelPath must not be null, undefined or empty.');
    }
    this.modelPath = modelPath;
  }

  async save(modelArtifacts: ModelArtifacts): Promise<SaveResult> {
    return store.storeAction(this.modelPath, modelArtifacts)
  }

  async load(): Promise<ModelArtifacts> {
    return load.loadAction(this.modelPath)
  }

}

export const indexedDBRouter: IORouter = (url: string|string[]) => {
  // if (!env().getBool('IS_BROWSER')) return null;

  if (!Array.isArray(url) && url.startsWith(ChunkedIndexedDB.URL_SCHEME)) {
    return new ChunkedIndexedDB(url.slice(ChunkedIndexedDB.URL_SCHEME.length));
  } else {
    return null;
  }
};
IORouterRegistry.registerSaveRouter(indexedDBRouter);
IORouterRegistry.registerLoadRouter(indexedDBRouter);

export class ChunkedIndexedDBManager implements ModelStoreManager {

  async listModels(): Promise<{[path: string]: ModelArtifactsInfo}> {
    return new Promise<{[path: string]: ModelArtifactsInfo}>(
        (resolve, reject) => {
          resolve({}) // to be implemented
        });
  }

  async removeModel(path: string): Promise<ModelArtifactsInfo> {
    return new Promise<ModelArtifactsInfo>((resolve, reject) => {
      resolve() // to be implemented
    });
  }
}

try {
  ModelStoreManagerRegistry.registerManager(
    ChunkedIndexedDB.URL_SCHEME, new ChunkedIndexedDBManager());
} catch (err) {
}