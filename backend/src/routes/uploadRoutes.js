const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../../uploads/signatures');

// @desc    Upload signature image via multipart/form-data
// @route   POST /api/upload/signature
// @access  Private
router.post('/signature', protect, upload.single('signature'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an image file for signature upload',
    });
  }

  const fileUrl = `/uploads/signatures/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'Signature uploaded successfully',
    fileUrl,
    filename: req.file.filename,
  });
});

// @desc    Upload signature image via base64 (e.g. from canvas signature pad)
// @route   POST /api/upload/signature-base64
// @access  Private
router.post('/signature-base64', protect, (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({
      success: false,
      message: 'Please provide base64 image data',
    });
  }

  try {
    // Extract format and raw data
    const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9-+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid base64 image data' });
    }

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const filename = `sig-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const fileUrl = `/uploads/signatures/${filename}`;

    res.status(200).json({
      success: true,
      message: 'Signature saved successfully',
      fileUrl,
      filename,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to process base64 image: ' + err.message,
    });
  }
});

module.exports = router;
