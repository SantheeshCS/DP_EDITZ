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
  generateSignedUploadUrl,
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
    { name: 'previewMedia', maxCount: 1 },
    { name: 'templateFile', maxCount: 1 },
  ]),
  async (req, res) => {
    let uploadedPreviewPath = null;
    let uploadedTemplatePath = null;

    try {
      const { title, description, category, tags, templateUrl } = req.body;

      if (!title || !category) {
        return res.status(400).json({ error: 'Title and category are required fields.' });
      }

      if (!req.files || !req.files['previewMedia']) {
        return res.status(400).json({ error: 'Preview media is required.' });
      }

      if (!req.files['templateFile'] && !templateUrl) {
        return res.status(400).json({ error: 'Either a template file or a template app link must be provided.' });
      }

      const previewMediaFile = req.files['previewMedia'][0];
      const previewMediaType = previewMediaFile.mimetype.startsWith('video/') ? 'video' : 'image';

      // Format filenames with timestamp to prevent collisions
      const timestamp = Date.now();
      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);

      // Sanitize original filenames to only allow safe characters for Supabase storage keys
      const sanitizeFileName = (name) => {
        const ext = name.lastIndexOf('.') > 0 ? name.slice(name.lastIndexOf('.')) : '';
        const base = name.slice(0, name.length - ext.length);
        return base.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) + ext.toLowerCase();
      };

      const previewFileName = `previews-${timestamp}-${cleanTitle}-${sanitizeFileName(previewMediaFile.originalname)}`;
      
      uploadedPreviewPath = await uploadToSupabase(
        'previews',
        previewMediaFile.buffer,
        previewFileName,
        previewMediaFile.mimetype
      );
      
      const previewImageUrl = getPublicPreviewUrl(uploadedPreviewPath);

      // 2. Upload actual template file to private 'templates' bucket (if provided)
      if (req.files['templateFile']) {
        const templateFile = req.files['templateFile'][0];
        const templateFileName = `templates-${timestamp}-${cleanTitle}-${sanitizeFileName(templateFile.originalname)}`;
        uploadedTemplatePath = await uploadToSupabase(
          'templates',
          templateFile.buffer,
          templateFileName,
          templateFile.mimetype
        );
      }

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
        templateUrl: templateUrl || null,
        tags: parsedTags,
      });

      const savedTemplate = await newTemplate.save();
      
      const io = req.app.get('io');
      if (io) {
        io.emit('template_added', savedTemplate);
      }
      
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

// Helper for cleaning filenames
const sanitizeFileName = (name) => {
  const ext = name.lastIndexOf('.') > 0 ? name.slice(name.lastIndexOf('.')) : '';
  const base = name.slice(0, name.length - ext.length);
  return base.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) + ext.toLowerCase();
};

// Init upload: Generates signed upload URLs for client-side direct upload to Supabase
router.post('/templates/init-upload', authMiddleware, async (req, res) => {
  try {
    const { title, previewFileName, templateFileName } = req.body;

    if (!title || !previewFileName) {
      return res.status(400).json({ error: 'Title and preview filename are required.' });
    }

    const timestamp = Date.now();
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);

    // Generate paths
    const previewStoragePath = `previews-${timestamp}-${cleanTitle}-${sanitizeFileName(previewFileName)}`;
    const previewUrlData = await generateSignedUploadUrl('previews', previewStoragePath);

    let templateStoragePath = null;
    let templateUrlData = null;

    if (templateFileName) {
      templateStoragePath = `templates-${timestamp}-${cleanTitle}-${sanitizeFileName(templateFileName)}`;
      templateUrlData = await generateSignedUploadUrl('templates', templateStoragePath);
    }

    res.json({
      preview: {
        signedUrl: previewUrlData.signedUrl,
        path: previewUrlData.path,
      },
      template: templateUrlData ? {
        signedUrl: templateUrlData.signedUrl,
        path: templateUrlData.path,
      } : null,
    });
  } catch (error) {
    console.error('Init Upload Error:', error.message);
    res.status(500).json({ error: 'Failed to initialize upload session.' });
  }
});

// Finalize upload: Saves template metadata to DB after client-side upload finishes
router.post('/templates/finalize', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      templateUrl,
      previewStoragePath,
      templateStoragePath,
      previewMediaType,
    } = req.body;

    if (!title || !category || !previewStoragePath) {
      return res.status(400).json({ error: 'Title, category, and preview storage path are required.' });
    }

    if (!templateStoragePath && !templateUrl) {
      return res.status(400).json({ error: 'Either a template file path or a template app link must be provided.' });
    }

    const previewImageUrl = getPublicPreviewUrl(previewStoragePath);

    let parsedTags = [];
    if (tags) {
      parsedTags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    const newTemplate = new Template({
      title,
      description,
      category,
      previewImagePath: previewStoragePath,
      previewImageUrl,
      previewMediaType,
      fileStoragePath: templateStoragePath || null,
      templateUrl: templateUrl || null,
      tags: parsedTags,
    });

    const savedTemplate = await newTemplate.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('template_added', savedTemplate);
    }

    res.status(201).json(savedTemplate);
  } catch (error) {
    console.error('Finalize Upload Error:', error.message);
    res.status(500).json({ error: 'Server error while saving template metadata.' });
  }
});

// Edit template metadata (JWT Protected)
router.put('/templates/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, tags, templateUrl } = req.body;
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    if (title) template.title = title;
    if (description !== undefined) template.description = description;
    if (category) template.category = category;
    if (templateUrl !== undefined) template.templateUrl = templateUrl;
    
    if (tags !== undefined) {
      template.tags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    const updatedTemplate = await template.save();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('template_updated', updatedTemplate);
    }
    
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

    const io = req.app.get('io');
    if (io) {
      io.emit('template_deleted', { id });
    }

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
