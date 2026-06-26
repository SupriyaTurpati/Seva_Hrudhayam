const { Model } = require('./baseModel');

class FutureBookingModel extends Model {
  constructor() {
    super('future_bookings', {
      donorId: { table: 'donors', modelName: 'Donor' },
      acceptedBy: { table: 'orphanages', modelName: 'Orphanage' }
    });
  }
}

module.exports = new FutureBookingModel();
