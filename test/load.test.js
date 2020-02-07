import '@babel/polyfill'

import load from '../src/load';
import utils from '../src/utils/utils';

describe('load', async () => {
  beforeEach(async function() {
    await utils.deleteDatabase();
  });

  afterEach(async function() {
    await utils.deleteDatabase();
  });

  it('throws 404 when model does not found', async () => {
    let error, model = null;
    try {
      model = await load.loadAction('foo', null);
    } catch(err) {
      error = err;
    }

    expect(error).not.toEqual(null);
    expect(error.code).toEqual(404);
    expect(model).toEqual(null);
  });
});