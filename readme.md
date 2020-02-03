# Tensorflow.js IndexedDB Actions
Allows users to store big models client-side in the indexedDB.

## Installation

## Usage 

### loadAndStoreLayersModel(url: String, id: String)
To not make 2 requests to load a model, only use the loader in this package. Once the model gets loaded it will also get stored in the IndexedDB. 

```python
// optional: register custom layers
tf.serialization.registerClass(MyCustomLayer);

const model = await loadAndStoreLayersModel('https://foo.com/model.json', 'foo');
```

### loadFromIndexedDb(id: String)

```python
// optional: register custom layers
tf.serialization.registerClass(MyCustomLayer);

const model = await loadFromIndexedDb('foo');
```