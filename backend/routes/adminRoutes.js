const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Template = require('../models/Template');
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
    fileSize: 500 * 1024 * 1024, // 500MB file limit to accommodate video previews and larger templates
  },
});

// Admin login route
router.post('/login', async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ error: 'Please provide both Admin ID and password.' });
    }

    const envAdminId = process.env.ADMIN_ID;
    const envHash = process.env.ADMIN_PASSWORD_HASH;

    if (!envAdminId || !envHash) {
      return res.status(500).json({ error: 'Admin credentials not configured on server.' });
    }

    if (adminId !== envAdminId) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    // Compare bcrypt hashes
    const isMatch = await bcrypt.compare(password, envHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    // Sign JWT (valid for 24h)
    const token = jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: '24h' });

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
    { name: 'previewMedia', maxCount: 1 },
    { name: 'templateFile', maxCount: 1 },
  ]),
  async (req, res) => {
    let uploadedPreviewPath = null;
    let uploadedTemplatePath = null;

    try {
      const { title, description, category, tags } = req.body;

      if (!title || !category) {
        return res.status(400).json({ error: 'Title and category are required fields.' });
      }

      if (!req.files || !req.files['previewMedia'] || !req.files['templateFile']) {
        return res.status(400).json({ error: 'Both preview media and template file are required.' });
      }

      const previewMediaFile = req.files['previewMedia'][0];
      const templateFile = req.files['templateFile'][0];

      const previewMediaType = previewMediaFile.mimetype.startsWith('video/') ? 'video' : 'image';

      // Format filenames with timestamp to prevent collisions
      const timestamp = Date.now();
      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      
      const previewFileName = `previews-${timestamp}-${cleanTitle}-${previewMediaFile.originalname}`;
      const templateFileName = `templates-${timestamp}-${cleanTitle}-${templateFile.originalname}`;

      // 1. Upload preview media to public 'previews' bucket
      uploadedPreviewPath = await uploadToSupabase(
        'previews',
        previewMediaFile.buffer,
        previewFileName,
        previewMediaFile.mimetype
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

      // 4. Save to MongoDB
      const newTemplate = new Template({
        title,
        description,
        category,
        previewImagePath: uploadedPreviewPath,
        previewImageUrl,
        previewMediaType,
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
    const { title, description, category, tags } = req.body;
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    if (title) template.title = title;
    if (description !== undefined) template.description = description;
    if (category) template.category = category;
    
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

    // 1. Delete preview media from Supabase 'previews' bucket
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

// Helper function to programmatically update the password hash in the backend .env file
const fs = require('fs');
const path = require('path');

const updateEnvPasswordHash = (newHash) => {
  try {
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
      console.warn('.env file not found, skipping file update.');
      return false;
    }
    let envContent = fs.readFileSync(envPath, 'utf8');
    // Replace the ADMIN_PASSWORD_HASH key
    envContent = envContent.replace(/ADMIN_PASSWORD_HASH=.*/, `ADMIN_PASSWORD_HASH=${newHash}`);
    fs.writeFileSync(envPath, envContent, 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to write new password hash to .env file:', err.message);
    return false;
  }
};

// POST /api/admin/change-password — Update admin password (JWT Protected)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide both current and new passwords.' });
    }

    const envHash = process.env.ADMIN_PASSWORD_HASH;
    if (!envHash) {
      return res.status(500).json({ error: 'Password hash configuration is missing.' });
    }

    // 1. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, envHash);
    if (!isMatch) {
      return res.status(450).json({ error: 'Incorrect current password.' }); // Custom status code or 400
    }

    // 2. Generate new bcrypt hash
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // 3. Persist new hash to .env file
    const persisted = updateEnvPasswordHash(newHash);
    if (!persisted) {
      return res.status(500).json({ error: 'Failed to save new password to backend configuration.' });
    }

    // 4. Update in-memory environment variable
    process.env.ADMIN_PASSWORD_HASH = newHash;

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change Password Error:', error.message);
    res.status(500).json({ error: 'Server error while updating password.' });
  }
});

module.exports = router;
