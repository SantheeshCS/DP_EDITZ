const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
}

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

/**
 * Uploads a file buffer to a specified Supabase bucket.
 * @param {string} bucketName - 'previews' (public) or 'templates' (private)
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} fileName - Destination filename/path in bucket
 * @param {string} mimeType - The mime type of the file
 */
const uploadToSupabase = async (bucketName, fileBuffer, fileName, mimeType) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Upload Error to bucket '${bucketName}': ${error.message}`);
  }

  return data.path;
};

/**
 * Gets the public URL of an asset in the public previews bucket.
 * @param {string} path - The preview file path inside the 'previews' bucket
 */
const getPublicPreviewUrl = (path) => {
  const { data } = supabase.storage.from('previews').getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Generates a signed URL for a file in the private templates bucket.
 * @param {string} fileStoragePath - The file path in the 'templates' bucket
 * @param {number} expirySeconds - Time before link expires (default 900s = 15m)
 */
const generateSignedUrl = async (fileStoragePath, expirySeconds = 900) => {
  const { data, error } = await supabase.storage
    .from('templates')
    .createSignedUrl(fileStoragePath, expirySeconds);

  if (error) {
    throw new Error(`Supabase Signed URL Error: ${error.message}`);
  }

  return data.signedUrl;
};

/**
 * Deletes a file from a specified Supabase bucket.
 * @param {string} bucketName - Bucket name
 * @param {string} path - File storage path
 */
const deleteFileFromSupabase = async (bucketName, path) => {
  const { data, error } = await supabase.storage.from(bucketName).remove([path]);
  if (error) {
    console.error(`Error deleting file from Supabase (${bucketName}/${path}):`, error.message);
  }
  return data;
};

module.exports = {
  supabase,
  uploadToSupabase,
  getPublicPreviewUrl,
  generateSignedUrl,
  deleteFileFromSupabase,
};
