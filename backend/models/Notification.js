const { Model } = require('./baseModel');

class NotificationModel extends Model {
  constructor() {
    super('notifications');
  }
}

module.exports = new NotificationModel();
