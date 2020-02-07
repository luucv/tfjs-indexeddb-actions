import '@babel/polyfill';

import load from './load';
import store from './store';

export default {
  async loadAndStoreLayersModel(url, name, customLayers = null) {
    const artifacts = await store.convertUrlToArtifacts(url);
    await store.storeAction(artifacts, name);
    const model = await load.loadAction(name, customLayers);

    return model;
  },
  async loadFromIndexedDb(name, customLayers = null) {
    const model = await load.loadAction(name, customLayers);

    return model;
  },
};