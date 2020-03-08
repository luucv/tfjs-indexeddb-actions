# Tensorflow.js IndexedDB Helpers
Allows users to store big tensorflow.js models on the client-side within the indexedDB.

## Installation
```
npm install --save tfjs-indexeddb-helpers
```

## Usage

```js
import * as tf from '@tensorflow/tfjs'
import 'tfjs-indexeddb-helpers'

const model = await tf.loadLayersModel('https://foo.com/model.json')
model.save('chunked-indexeddb://foo')

const loadedModel = await tf.loadLayersModel('chunked-indexeddb://foo')
```

<!-- ### loadAndStoreLayersModel(url: String, id: String)
To not make 2 requests to load a model, only use the loader in this package. Once the model gets loaded it will also get stored in the IndexedDB.

```js
import { loadAndStoreLayersModel } from 'tfjs-indexeddb-helpers';

const modelArtifacts = await loadAndStoreLayersModel('https://foo.com/model.json', 'foo');
```

### loadFromIndexedDb(id: String)

```js
import { loadFromIndexedDb } from 'tfjs-indexeddb-helpers';

const modelArtifacts = await loadFromIndexedDb('foo');
``` -->