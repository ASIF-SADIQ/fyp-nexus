const mongoose = require('mongoose');
const User = require('./models/User'); // Path to your User model
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin already exists!');
      process.exit();
    }

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@university.edu',
      password: 'SecureAdminPassword123', // This will be auto-hashed by your schema pre-save hook
      role: 'admin',
      department: 'Administration',
    });

    console.log('Admin Account Created Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();