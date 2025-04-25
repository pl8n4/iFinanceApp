require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../db');
const AccountCategory = require('../models/AccountCategory');

(async function seedCategories() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // Only seed if no categories exist
    const categoryCount = await AccountCategory.count();
    if (categoryCount > 0) {
      console.log('> Account categories already seeded.');
      process.exit(0);
    }

    // Create default categories
    const categories = [
      { id: uuidv4(), name: 'Assets', type: 'Debit' },
      { id: uuidv4(), name: 'Liabilities', type: 'Credit' },
      { id: uuidv4(), name: 'Income', type: 'Credit' },
      { id: uuidv4(), name: 'Expenses', type: 'Debit' }
    ];

    await AccountCategory.bulkCreate(categories);

    console.log('> Seeded account categories: Assets, Liabilities, Income, Expenses');
    process.exit(0);
  } catch (err) {
    console.error('⨯ Failed to seed account categories:', err);
    process.exit(1);
  }
})();