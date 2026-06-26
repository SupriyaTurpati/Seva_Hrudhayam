const { Model } = require('./baseModel');

class DonationRequestModel extends Model {
  constructor() {
    super('donation_requests', {
      donorId: { table: 'donors', modelName: 'Donor' },
      acceptedBy: { table: 'orphanages', modelName: 'Orphanage' }
    });
  }
}

module.exports = new DonationRequestModel();
