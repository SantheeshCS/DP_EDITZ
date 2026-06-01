const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

// GET /api/templates — List all templates (title, category, price, previewImageUrl, tags, etc.)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    // Filter by category if provided
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by title or tags using search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const templates = await Template.find(query)
      .select('title category price previewImageUrl tags description createdAt downloadCount')
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    console.error('List Templates Error:', error.message);
    res.status(500).json({ error: 'Server error while retrieving templates.' });
  }
});

// GET /api/templates/:id — Get details of a single template
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get Single Template Error:', error.message);
    // Handle invalid ObjectId cast error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Template not found.' });
    }
    res.status(500).json({ error: 'Server error retrieving template details.' });
  }
});

module.exports = router;
