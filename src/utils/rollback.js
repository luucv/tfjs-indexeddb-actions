export default {
  array(db, storeName, keyPaths) {
    return new Promise(async (resolve, reject) => {
      await Promise.all(keyPaths.map(keyPath => {
        this.single(db, storeName, keyPath)
          .then(() => resolve())
          .catch(() => reject());
      }));
    });
  },

  single(db, storeName, keyPath) {
    return new Promise((resolve, reject) => {
      const storeTx = db.transaction(storeName, 'readwrite');
      const store = storeTx.objectStore(storeName);

      let deleteInfoRequest;
      try {
        deleteInfoRequest = store.delete(keyPath);
      } catch (err) {
        return reject(err);
      }

      deleteInfoRequest.onsuccess = () => {
        return resolve();
      };
      deleteInfoRequest.onerror = error => {
        return reject(error);
      };
    });
  }
}