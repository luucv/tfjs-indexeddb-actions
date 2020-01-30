export default class HandlerMock {
  constructor(artifacts) {
    this.artifacts = artifacts;
  }
  async load() {
    return this.artifacts;
  }
};