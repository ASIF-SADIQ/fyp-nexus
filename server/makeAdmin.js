const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

// 👇 REPLACE THIS WITH THE EMAIL YOU REGISTERED WITH
const TARGET_EMAIL = "admin@fyp.com"; 

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    const user = await User.findOne({ email: TARGET_EMAIL });

    if (!user) {
      console.log("❌ User not found! Register this email on the signup page first.");
      process.exit();
    }

    user.role = "admin";
    await user.save();

    console.log(`✅ SUCCESS! User ${user.name} (${user.email}) is now an ADMIN.`);
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

makeAdmin();