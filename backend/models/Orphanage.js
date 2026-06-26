const { Model } = require('./baseModel');

class OrphanageModel extends Model {
  constructor() {
    super('orphanages', {
      headId: { table: 'orphanage_heads', modelName: 'OrphanageHead' }
    });
  }
}

module.exports = new OrphanageModel();
