import '@babel/polyfill';
// import * as tf from '@tensorflow/tfjs';
// import { io as tfio } from '@tensorflow/tfjs-core';
// tf.io.registerLoadRouter(chunkeddb.chunkedDBRouter);
// tf.io.registerSaveRouter(chunkeddb.chunkedDBRouter);

import { chunkedDBRouter, ChunkedDBManager } from './chunkeddb';

export { chunkedDBRouter, ChunkedDBManager };
