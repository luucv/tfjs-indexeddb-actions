export const modelTopology = {
  'class_name': 'Sequential',
  'keras_version': '2.1.4',
  'config': [{
    'class_name': 'Dense',
    'config': {
      'kernel_initializer': {
        'class_name': 'VarianceScaling',
        'config': {
          'distribution': 'uniform',
          'scale': 1.0,
          'seed': null,
          'mode': 'fan_avg'
        }
      },
      'name': 'dense',
      'kernel_constraint': null,
      'bias_regularizer': null,
      'bias_constraint': null,
      'dtype': 'float32',
      'activation': 'linear',
      'trainable': true,
      'kernel_regularizer': null,
      'bias_initializer': {'class_name': 'Zeros', 'config': {}},
      'units': 1,
      'batch_input_shape': [null, 3],
      'use_bias': true,
      'activity_regularizer': null
    }
  }],
  'backend': 'tensorflow'
};
export const weightSpecs = [
  {
    name: 'dense/kernel',
    shape: [3, 1],
    dtype: 'float32',
  },
  {
    name: 'dense/bias',
    shape: [1],
    dtype: 'float32',
  }
];
export const weightData = new ArrayBuffer(16);
export const artifacts = {
  modelTopology: modelTopology,
  weightSpecs: weightSpecs,
  weightData: weightData,
  format: 'layers-model',
  generatedBy: 'TensorFlow.js v0.0.0',
  convertedBy: null
};