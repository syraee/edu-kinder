const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const prisma = require("../../prisma/client");
const axios = require('axios')
const FormData = require('form-data')

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
const uploadDisk = multer({
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

const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
        if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
            return cb(new Error('Nepovolený typ súboru'));
        }
        cb(null, true);
    }
});

async function getAllFaces(filePath, classIds){
    const children = await prisma.child.findMany({
        where: {
            groupId: {
                in: classIds
            }
        },
        include: {
            FaceEmbedding: true,
            group: true
        }
    });

    const childrenFormatted = {};
    for (const child of children) {
        childrenFormatted[child.id] = {
            name: child.firstName + " " + child.lastName,
            embeddings: Array.isArray(child.FaceEmbedding)
                ? child.FaceEmbedding.map(e => e.embedding)
                : []
        };
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("children", JSON.stringify(childrenFormatted));

    const response = await axios.post(
        "http://localhost:8000/recognize_faces",
        form,
        { headers: form.getHeaders() }
    );

    return response.data;

}

// POST /
router.post('/', uploadDisk.array('photos', 50), async (req, res) => {
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

    const { schoolYear, eventName, classIds } = req.body;

    if (!schoolYear || !eventName || !classIds) {
        req.files.forEach(f => fs.unlinkSync(f.path));
        return res.status(400).json({ message: 'Chýba schoolYear, eventName alebo classIds' });
    }

    let classIdsArray = [];
    if (Array.isArray(classIds)) {
        classIdsArray = classIds.map(id => parseInt(id));
    } else if (typeof classIds === 'string') {
        classIdsArray = classIds.split(',').map(id => parseInt(id.trim()));
    } else {
        req.files.forEach(f => fs.unlinkSync(f.path));
        return res.status(400).json({ message: 'classIds musí byť pole alebo string' });
    }

    const safeSchoolYear = schoolYear.replace(/[\/\\]/g, '-');
    const safeEventName = eventName.replace(/[\/\\]/g, '-');

    const finalDir = path.join('uploads', safeSchoolYear, safeEventName);
    fs.mkdirSync(finalDir, { recursive: true });

    let event = await prisma.event.findFirst({
        where: { name: eventName, schoolYear },
    });

    if (!event) {
        event = await prisma.event.create({
            data: {
                name: eventName,
                schoolYear,
                classes: {
                    create: classIdsArray.map(id => ({
                        class: { connect: { id } }
                    }))
                }
            }
        });
    }

    const processedFiles = [];

    for (const file of req.files) {
        const finalName = file.filename.replace(path.extname(file.filename), '.webp');
        const finalPath = path.join(finalDir, finalName);

        await sharp(file.path)
            .resize({ width: 1920, height: 1920, withoutEnlargement: true })
            .webp({ quality: 75 })
            .toFile(finalPath);

        const faces = await getAllFaces(file.path, classIdsArray);

        fs.unlinkSync(file.path);

        for (let j = 0; j < faces.length; j++) {
            console.log(`Počet tvárí na fotke ${file.originalname}: ${faces[j]}`);
        }

        const photo = await prisma.photo.create({
            data: {
                filePath: finalPath,
                event: { connect: { id: event.id } },
                PhotoOnClass: {
                    create: classIdsArray.map(id => ({ classId: id }))
                }
            }
        });


        processedFiles.push({
            originalName: file.originalname,
            savedAs: finalName,
            url: finalPath,
            faces: faces
        });
    }

    res.status(200).json({
        message: 'Fotky úspešne nahraté a komprimované!',
        count: processedFiles.length,
        files: processedFiles
    });
});


// POST /embedding
router.post("/embedding", uploadMemory.array("photos", 5), async (req, res) => {
    const { childId } = req.body;
    if (!childId) return res.status(400).json({ message: "childId is required" });
    if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });

    const processedFiles = [];

    for (const file of req.files) {
        try {
            const formData = new FormData();
            formData.append("photo", file.buffer, file.originalname);

            const response = await axios.post(
                "http://localhost:8000/extract_embedding",
                formData,
                { headers: formData.getHeaders(), timeout: 15000 }
            );

            const embedding = response.data.embedding;

            const record = await prisma.faceEmbedding.create({
                data: {
                    childId: parseInt(childId),
                    embedding: embedding,
                },
            });

            processedFiles.push({
                originalName: file.originalname,
                embeddingId: record.id,
            });
        } catch (err) {
            console.error("Error processing file:", file.originalname, err);
        }
    }

    res.status(200).json({
        message: "Embeddings extracted and saved successfully",
        count: processedFiles.length,
        files: processedFiles,
    });
});

// GET /photos/event/:eventId
router.get('/event/:eventId', async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const photos = await prisma.photo.findMany({
        where: { eventId },
        include: { PhotoOnClass: { include: { class: true } } },
        orderBy: { createdAt: 'desc' }
    });

    res.json({ count: photos.length, photos });
});

// GET /photos/class/:classId
router.get('/class/:classId', async (req, res) => {
    const classId = parseInt(req.params.classId);
    const photos = await prisma.photo.findMany({
        where: { PhotoOnClass: { some: { classId } } },
        include: { PhotoOnClass: { include: { class: true } }, event: true },
        orderBy: { createdAt: 'desc' }
    });

    res.json({ count: photos.length, photos });
});

// GET /photos/:id
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const photo = await prisma.photo.findUnique({
        where: { id },
        include: {
            event: true,
            PhotoOnClass: { include: { class: true } },
            FaceOnPhoto: { include: { child: true } }
        }
    });

    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    res.json(photo);
});

module.exports = router;
