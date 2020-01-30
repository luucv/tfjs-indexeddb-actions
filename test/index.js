import '@babel/polyfill'
import { storeAction, deleteDatabase } from '../src/index';
import { artifacts } from './mocks/model';

describe('tfjs-indexeddb-actions', async () => {
  beforeEach(async function() {
    await deleteDatabase();
  });


  it('saves a model', async () => {
    
    let err = null;
    let res;

    try {
      res = await storeAction(artifacts, 'foo');
    } catch (error) {
      err = error;
    }

    expect(err).toEqual(null);
	
  });
});