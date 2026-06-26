require('dotenv').config();
const { connectDB } = require('./config/db');
const Admin = require('./models/Admin');
const Donor = require('./models/Donor');
const OrphanageHead = require('./models/OrphanageHead');
const Orphanage = require('./models/Orphanage');
const DonationRequest = require('./models/DonationRequest');
const FutureBooking = require('./models/FutureBooking');
const Notification = require('./models/Notification');
const DonationHistory = require('./models/DonationHistory');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Database connected and initialized for seeding...');

    // Clear existing data (except admins to preserve admin account)
    await Donor.deleteMany({});
    await OrphanageHead.deleteMany({});
    await Orphanage.deleteMany({});
    await DonationRequest.deleteMany({});
    await FutureBooking.deleteMany({});
    await Notification.deleteMany({});
    await DonationHistory.deleteMany({});

    console.log('Cleared existing collections...');

    // 1. Create Test Donors
    const donor1 = await Donor.create({
      name: 'Ramesh Kumar',
      phone: '9876543210',
      password: 'donor123', // Will be hashed automatically by pre-save
      pincode: '500010',
      village: 'Alwal',
      district: 'Hyderabad',
      servingCount: 150
    });

    const donor2 = await Donor.create({
      name: 'Anjali Sharma',
      phone: '9876543211',
      password: 'donor123',
      pincode: '500081',
      village: 'Madhapur',
      district: 'Hyderabad',
      servingCount: 50
    });

    console.log('Seeded 2 Donors.');

    // 2. Create Orphanage Heads (Verified & Pending)
    const head1 = await OrphanageHead.create({
      headName: 'Father Joseph',
      phone: '8765432101',
      password: 'head123',
      isVerified: true
    });

    const head2 = await OrphanageHead.create({
      headName: 'Sister Teresa',
      phone: '8765432102',
      password: 'head123',
      isVerified: true
    });

    const head3 = await OrphanageHead.create({
      headName: 'Swami Vivekananda',
      phone: '8765432103',
      password: 'head123',
      isVerified: false // Unverified - should not receive notifications
    });

    const head4 = await OrphanageHead.create({
      headName: 'Kalyan Rao',
      phone: '8765432104',
      password: 'head123',
      isVerified: true // Verified but far away (Guntur District)
    });

    console.log('Seeded 4 Orphanage Heads.');

    // 3. Create Corresponding Orphanage Profiles
    // Coordinates set up from Alwal, Hyderabad center (17.5011, 78.5028)
    
    // Close range: 0.8 km (Alwal)
    await Orphanage.create({
      orphanageName: 'Hope Child Haven',
      headName: head1.headName,
      phone: '0402345671',
      email: 'hope@childhaven.org',
      boysCount: 25,
      girlsCount: 30,
      district: 'Hyderabad',
      village: 'Alwal',
      pincode: '500010',
      latitude: 17.5050,
      longitude: 78.5050,
      headId: head1._id
    });

    // Medium range: 9.2 km (Secunderabad)
    await Orphanage.create({
      orphanageName: 'Grace Care Home',
      headName: head2.headName,
      phone: '0402345672',
      email: 'grace@carehome.org',
      boysCount: 15,
      girlsCount: 20,
      district: 'Hyderabad',
      village: 'Secunderabad',
      pincode: '500003',
      latitude: 17.4399,
      longitude: 78.4983,
      headId: head2._id
    });

    // Close range: 12.4 km but UNVERIFIED
    await Orphanage.create({
      orphanageName: 'Smile Orphan Foundation',
      headName: head3.headName,
      phone: '0402345673',
      email: 'smile@foundation.org',
      boysCount: 40,
      girlsCount: 35,
      district: 'Hyderabad',
      village: 'Madhapur',
      pincode: '500081',
      latitude: 17.4412,
      longitude: 78.3812,
      headId: head3._id
    });

    // Far away: 250 km (Guntur District)
    await Orphanage.create({
      orphanageName: 'Care and Share Center',
      headName: head4.headName,
      phone: '0863234567',
      email: 'care@shareguntur.org',
      boysCount: 50,
      girlsCount: 50,
      district: 'Guntur',
      village: 'Broadipet',
      pincode: '522002',
      latitude: 16.3067,
      longitude: 80.4365,
      headId: head4._id
    });

    console.log('Seeded 4 Orphanage Profiles.');
    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
