import '@babel/polyfill';

import load from './load';
import store from './store';

export default {
  async loadAndStoreLayersModel(url, name) {
    const artifacts = await store.convertUrlToArtifacts(url);
    await store.storeAction(artifacts, name);
    const model = await load.loadAction(name);

    return model;
  },
  async loadFromIndexedDb(name) {
    const model = await load.loadAction(name);

    return model;
  },
};