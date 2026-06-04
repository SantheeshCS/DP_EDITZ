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

    if (!template.fileStoragePath) {
      return res.status(404).json({ error: 'Template file is missing.' });
    }

    // Generate a 15-minute signed URL
    const signedDownloadUrl = await generateSignedUrl(template.fileStoragePath, 900);
    
    if (!signedDownloadUrl) {
      throw new Error('Failed to generate signed download URL');
    }

    // Increment download count
    template.downloadCount = (template.downloadCount || 0) + 1;
    await template.save();

    res.json({
      status: 'success',
      signedDownloadUrl,
      templateTitle: template.title,
    });
  } catch (error) {
    console.error('Download Link Error:', error.message);
    res.status(500).json({ error: 'Server error generating download link.' });
  }
});

module.exports = router;
