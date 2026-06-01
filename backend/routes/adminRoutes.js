const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Template = require('../models/Template');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');
const {
  uploadToSupabase,
  getPublicPreviewUrl,
  deleteFileFromSupabase,
} = require('../utils/supabase');

// Multer memory storage config for handling file buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB file limit
  },
});

// Admin login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const envEmail = process.env.ADMIN_EMAIL;
    const envHash = process.env.ADMIN_PASSWORD_HASH;

    if (!envEmail || !envHash) {
      return res.status(500).json({ error: 'Admin credentials not configured on server.' });
    }

    if (email.toLowerCase() !== envEmail.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    // Compare bcrypt hashes
    const isMatch = await bcrypt.compare(password, envHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    // Sign JWT (valid for 24h)
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Create new template (JWT Protected + multipart)
router.post(
  '/templates',
  authMiddleware,
  upload.fields([
    { name: 'previewImage', maxCount: 1 },
    { name: 'templateFile', maxCount: 1 },
  ]),
  async (req, res) => {
    let uploadedPreviewPath = null;
    let uploadedTemplatePath = null;

    try {
      const { title, description, category, price, tags } = req.body;

      if (!title || !category || !price) {
        return res.status(400).json({ error: 'Title, category, and price are required fields.' });
      }

      if (!req.files || !req.files['previewImage'] || !req.files['templateFile']) {
        return res.status(400).json({ error: 'Both preview image and template file are required.' });
      }

      const previewImageFile = req.files['previewImage'][0];
      const templateFile = req.files['templateFile'][0];

      // Format filenames with timestamp to prevent collisions
      const timestamp = Date.now();
      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      
      const previewFileName = `previews-${timestamp}-${cleanTitle}-${previewImageFile.originalname}`;
      const templateFileName = `templates-${timestamp}-${cleanTitle}-${templateFile.originalname}`;

      // 1. Upload preview image to public 'previews' bucket
      uploadedPreviewPath = await uploadToSupabase(
        'previews',
        previewImageFile.buffer,
        previewFileName,
        previewImageFile.mimetype
      );
      const previewImageUrl = getPublicPreviewUrl(uploadedPreviewPath);

      // 2. Upload actual template file to private 'templates' bucket
      uploadedTemplatePath = await uploadToSupabase(
        'templates',
        templateFile.buffer,
        templateFileName,
        templateFile.mimetype
      );

      // 3. Process tags
      let parsedTags = [];
      if (tags) {
        parsedTags = tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }

      // Convert price from decimal Rs (e.g. 99.50) to integer Paise (e.g. 9950)
      const priceInPaise = Math.round(parseFloat(price) * 100);

      // 4. Save to MongoDB
      const newTemplate = new Template({
        title,
        description,
        category,
        price: priceInPaise,
        previewImagePath: uploadedPreviewPath,
        previewImageUrl,
        fileStoragePath: uploadedTemplatePath,
        tags: parsedTags,
      });

      const savedTemplate = await newTemplate.save();
      res.status(201).json(savedTemplate);
    } catch (error) {
      console.error('Template Upload Error:', error.message);

      // Rollback Supabase uploads if database save fails
      if (uploadedPreviewPath) {
        await deleteFileFromSupabase('previews', uploadedPreviewPath);
      }
      if (uploadedTemplatePath) {
        await deleteFileFromSupabase('templates', uploadedTemplatePath);
      }

      res.status(500).json({ error: error.message || 'Server error while creating template.' });
    }
  }
);

// Edit template metadata (JWT Protected)
router.put('/templates/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, price, tags } = req.body;
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    if (title) template.title = title;
    if (description !== undefined) template.description = description;
    if (category) template.category = category;
    
    if (price !== undefined) {
      // Convert Price in Rs to Paise
      template.price = Math.round(parseFloat(price) * 100);
    }

    if (tags !== undefined) {
      template.tags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Template Edit Error:', error.message);
    res.status(500).json({ error: 'Server error while updating template.' });
  }
});

// Delete template and remove both files from Supabase (JWT Protected)
router.delete('/templates/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    // 1. Delete preview image from Supabase 'previews' bucket
    if (template.previewImagePath) {
      await deleteFileFromSupabase('previews', template.previewImagePath);
    }

    // 2. Delete actual template file from Supabase 'templates' bucket
    if (template.fileStoragePath) {
      await deleteFileFromSupabase('templates', template.fileStoragePath);
    }

    // 3. Delete from MongoDB
    await Template.findByIdAndDelete(id);

    res.json({ message: 'Template and files deleted successfully.' });
  } catch (error) {
    console.error('Template Deletion Error:', error.message);
    res.status(500).json({ error: 'Server error while deleting template.' });
  }
});

// Get all orders with status + template name (JWT Protected)
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('templateId', 'title price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get Orders Error:', error.message);
    res.status(500).json({ error: 'Server error fetching orders.' });
  }
});

module.exports = router;
