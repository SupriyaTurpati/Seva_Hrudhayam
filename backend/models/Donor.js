const { Model } = require('./baseModel');

class DonorModel extends Model {
  constructor() {
    super('donors');
  }
}

module.exports = new DonorModel();
