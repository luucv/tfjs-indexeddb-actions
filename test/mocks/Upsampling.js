import * as tf from '@tensorflow/tfjs';

class Upsampling extends tf.layers.Layer {
  constructor(config) {
    super(config);
    this.newSize = config.newSize;
  }

  getConfig() {
    const config = super.getConfig();
    Object.assign(config, {newSize: this.newSize});
    return config;
  }

  computeOutputShape(inputShape) {
    return [inputShape[0], this.newSize[0], this.newSize[1], inputShape[3]];
  }

  call (inputs, kwargs) {
    const resized = tf.image.resizeBilinear(inputs[0], [this.newSize[0], this.newSize[1]], true);
    return resized;
  }

  static get className () {
    return 'Upsampling';
  }
}

export default Upsampling;