const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Template = require('../models/Template');
const { generateSignedUrl } = require('../utils/supabase');

// GET /api/download/:id — Retrieve free direct download link
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid template reference.' });
    }

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    let downloadLink = null;

    if (template.templateUrl) {
      downloadLink = template.templateUrl;
    } else if (template.fileStoragePath) {
      // Generate a 15-minute signed URL
      downloadLink = await generateSignedUrl(template.fileStoragePath, 900);
    } else {
      return res.status(404).json({ error: 'Template file or link is missing.' });
    }
    
    if (!downloadLink) {
      throw new Error('Failed to generate download URL');
    }

    // Increment download count
    template.downloadCount = (template.downloadCount || 0) + 1;
    await template.save();

    res.json({
      status: 'success',
      downloadUrl: downloadLink,
      templateTitle: template.title,
    });
  } catch (error) {
    console.error('Download Link Error:', error.message);
    res.status(500).json({ error: 'Server error generating download link.' });
  }
});

module.exports = router;
