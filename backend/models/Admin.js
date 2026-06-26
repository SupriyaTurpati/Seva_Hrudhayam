const { Model } = require('./baseModel');

class AdminModel extends Model {
  constructor() {
    super('admins');
  }
}

module.exports = new AdminModel();
