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
  }
}
