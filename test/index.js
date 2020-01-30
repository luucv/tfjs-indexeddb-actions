import '@babel/polyfill'

import load from '../src/load';
import store from '../src/store';
import utils from '../src/utils/utils';
import { artifacts } from './mocks/model';

describe('tfjs-indexeddb-actions', async () => {
  beforeEach(async function() {
    await utils.deleteDatabase();
  });

  afterEach(async function() {
    await utils.deleteDatabase();
  });

  it('saves a model', async () => {
    await store.storeAction(artifacts, 'foo');
  });

  it('saves and loads model', async () => {
    await store.storeAction(artifacts, 'foo');
    const model = await load.loadAction('foo');

    expect(model.name).toEqual('sequential_1');
  });
});