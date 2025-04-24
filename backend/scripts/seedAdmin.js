require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../db');
const BaseUser = require('../models/BaseUser');
const UserPassword = require('../models/UserPassword');
const Administrator = require('../models/Administrator');

(async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();  // adjust if you prefer alter:false here

    // Only seed if no admins exist
    const adminCount = await Administrator.count();
    if (adminCount > 0) {
      console.log('> Admin user already seeded.');
      process.exit(0);
    }

    // 1) Create BaseUser
    const user = await BaseUser.create({
      name: 'Super Admin',
      userName: 'admin',
      role: 'admin'
    });

    // 2) Hash & store password
    const hash = await bcrypt.hash('admin', parseInt(process.env.SALT_ROUNDS) || 10);
    await UserPassword.create({
      id: user.id,
      userName: 'admin',
      encryptedPassword: hash
    });

    // 3) Create Administrator profile
    await Administrator.create({
      id: user.id,
      dateHired: new Date(),
      dateFinished: null
    });

    console.log(`> Seeded admin: admin / admin`);
    process.exit(0);
  } catch (err) {
    console.error('⨯ Failed to seed admin:', err);
    process.exit(1);
  }
})();
