import '@babel/polyfill'
import idbService from '../src/index';
import { artifacts } from './mocks/model';

describe('tfjs-indexeddb-actions', async () => {
  beforeEach(async function() {
    await idbService.deleteDatabase();
  });

  afterEach(async function() {
    await idbService.deleteDatabase();
  });

  it('saves a model', async () => {
    await idbService.storeAction(artifacts, 'foo');
  });

  it('saves and loads model', async () => {
    await idbService.storeAction(artifacts, 'foo');
    const model = await idbService.loadAction('foo');

    expect(model.name).toEqual('sequential_1');
  });
});