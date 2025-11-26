const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempPath = 'uploads/temp';
        fs.mkdirSync(tempPath, { recursive: true });
        cb(null, tempPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg'];
        if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
            return cb(new Error('Nepovolený typ súboru'));
        }
        cb(null, true);
    }
});

// POST /upload
router.post('/', upload.array('photos', 50), async (req, res) => {
    /*
      #swagger.tags = ['Photos']
      #swagger.summary = 'Nahraj fotku na server do štruktúry podľa školského roku a udalosti'

      #swagger.consumes = ['multipart/form-data']

      #swagger.parameters['photo'] = {
          in: 'formData',
          type: 'file',
          required: true,
          description: 'Fotka, ktorá sa má nahrať'
      }
      #swagger.parameters['schoolYear'] = {
          in: 'formData',
          type: 'string',
          required: true,
          description: 'Školský rok, napr. 2025/26'
      }
      #swagger.parameters['eventName'] = {
          in: 'formData',
          type: 'string',
          required: true,
          description: 'Názov udalosti, napr. LetnyFestival'
      }
      #swagger.responses[200] = {
          description: 'Foto úspešne nahraté',
          schema: { message: 'Foto nahraté!', filePath: 'uploads/2025-26/LetnyFestival/1699112345678-123456789.jpg' }
      }
      #swagger.responses[400] = { description: 'Chýbajúce polia alebo žiadny súbor' }
    */

    const { schoolYear, eventName } = req.body;

    if (!schoolYear || !eventName) {
        req.files.forEach(f => fs.unlinkSync(f.path));
        return res.status(400).json({ message: 'Chýba schoolYear alebo eventName' });
    }

    const safeSchoolYear = schoolYear.replace(/[\/\\]/g, '-');
    const safeEventName = eventName.replace(/[\/\\]/g, '-');

    const finalDir = path.join('uploads', safeSchoolYear, safeEventName);
    fs.mkdirSync(finalDir, { recursive: true });

    const processedFiles = [];

    for (const file of req.files) {
        const finalName = file.filename.replace(path.extname(file.filename), '.webp');
        const finalPath = path.join(finalDir, finalName);

        await sharp(file.path)
            .resize({ width: 1920, height: 1920, withoutEnlargement: true }) // optional
            .webp({ quality: 75 })
            .toFile(finalPath);

        fs.unlinkSync(file.path);

        processedFiles.push({
            originalName: file.originalname,
            savedAs: finalName,
            url: finalPath
        });
    }

    res.status(200).json({
        message: 'Fotky úspešne nahraté a komprimované!',
        count: processedFiles.length,
        files: processedFiles
    });
});

module.exports = router;
