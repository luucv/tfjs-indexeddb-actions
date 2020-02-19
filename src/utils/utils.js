import { MODEL_STORE_NAME, INFO_STORE_NAME, WEIGHTS_STORE_NAME, DATABASE_VERSION, DATABASE_NAME } from '../globals';

export default {
  promisifyRequest(req) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-unused-vars
      req.onsuccess = e => resolve(req.result);
      // eslint-disable-next-line no-unused-vars
      req.onerror = e => {
        console.log('error') 
        reject(req.error)
      };
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
    console.log(INFO_STORE_NAME);
    const db = openRequest.result;
    db.createObjectStore(INFO_STORE_NAME, {keyPath: 'modelId'});
    db.createObjectStore(WEIGHTS_STORE_NAME, {keyPath: 'modelId'});
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

  arrayBufferToBlob(buffer, type) {
    return new Blob([buffer], {type: type});
  },

  blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', (e) => {
        resolve(reader.result);
      });
      reader.addEventListener('error', reject);
      reader.readAsArrayBuffer(blob);
    });
  }
};
