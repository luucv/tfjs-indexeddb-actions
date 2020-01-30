const DATABASE_NAME = 'tensorflowjs';
const DATABASE_VERSION = 1;
const MODEL_STORE_NAME = 'models_store';
const INFO_STORE_NAME = 'model_info_store';
const WEIGHTS_STORE_NAME = 'model_weights';

export default {
  promisifyRequest(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = e => resolve(req.result);
      req.onerror = e => reject(req.error);
    });
  },

  stringByteLength(str) {
    return new Blob([str]).size;
  },

  concatenateArrayBuffers(buffers) {
    let totalByteLength = 0;
    buffers.forEach((buffer) => {
      totalByteLength += buffer.byteLength;
    });
  
    const temp = new Uint8Array(totalByteLength);
    let offset = 0;
    buffers.forEach((buffer) => {
      temp.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    });
    return temp.buffer;
  },

  openDatabase() {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      openRequest.onupgradeneeded = () => this._setUpDatabase(openRequest);
      openRequest.onsuccess = (res) => resolve(res.target.result);
      openRequest.onerror = (err) => reject(err);
    });
  },

  _setUpDatabase(openRequest) {
    const db = openRequest.result;
    db.createObjectStore(MODEL_STORE_NAME, {keyPath: 'modelPath'});
    db.createObjectStore(INFO_STORE_NAME, {keyPath: 'modelPath'});
    db.createObjectStore(WEIGHTS_STORE_NAME, {keyPath: 'chunckId'});
  },

  deleteDatabase() {
    const theWindow = window;
    const factory = theWindow.indexedDB || theWindow.mozIndexedDB ||
        theWindow.webkitIndexedDB || theWindow.msIndexedDB ||
        theWindow.shimIndexedDB;
    if (factory == null) {
      throw new Error(
        'The current browser does not appear to support IndexedDB.');
    }
  
    return new Promise((resolve, reject) => {
      const deleteRequest = factory.deleteDatabase(DATABASE_NAME);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = error => reject(error);
    });
  },
}
