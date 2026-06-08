require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/template-store';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const validCategories = ['alight-motion', 'kinemaster', 'capcut', 'lightroom', 'other'];
    const result = await Template.updateMany(
      { category: { $nin: validCategories } },
      { $set: { category: 'other' } }
    );
    console.log(`Updated ${result.modifiedCount} templates to 'other'.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to DB', err);
    process.exit(1);
  });
