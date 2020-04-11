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

## Testing
1. Start model server with DEXTR model
2. `npm run test:watch`