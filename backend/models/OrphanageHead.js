const { Model } = require('./baseModel');

class OrphanageHeadModel extends Model {
  constructor() {
    super('orphanage_heads');
  }
}

module.exports = new OrphanageHeadModel();
