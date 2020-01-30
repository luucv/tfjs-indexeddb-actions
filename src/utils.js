export default {
  promisifyRequest(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = e => resolve(req.result);
      req.onerror = e => reject(req.error);
    });
  },
  stringByteLength(str) {
    return new Blob([str]).size;
  }
}
