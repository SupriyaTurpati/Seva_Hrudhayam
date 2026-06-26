const { Model } = require('./baseModel');

class DonationHistoryModel extends Model {
  constructor() {
    super('donation_histories', {
      donorId: { table: 'donors', modelName: 'Donor' },
      orphanageId: { table: 'orphanages', modelName: 'Orphanage' }
    });
  }
}

module.exports = new DonationHistoryModel();
