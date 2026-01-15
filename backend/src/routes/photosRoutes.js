const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const prisma = require("../../prisma/client");
const axios = require('axios')
const FormData = require('form-data')
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorizeRole");

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
    try {
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
            { headers: form.getHeaders(), timeout: 15000 }
        );

        return response.data;
    } catch (err) {
        console.warn("Face recognition failed, continuing without faces.", err?.message || err);
        return [];
    }

}

function getRoleType(user) {
    const role = user?.role;
    if (!role) return "";
    if (typeof role === "string") return role.toUpperCase();
    if (typeof role === "object") {
        return String(role.type || role.name || role.code || role.id || "").toUpperCase();
    }
    return String(role).toUpperCase();
}

async function getParentClassIds(userId) {
    if (!userId) return [];
    const guardians = await prisma.childGuardian.findMany({
        where: { userId: Number(userId) },
        include: { child: true }
    });
    const classIds = guardians
        .map((g) => g.child?.groupId)
        .filter((id) => Number.isFinite(id));
    return Array.from(new Set(classIds));
}

function handleMulterError(err, res) {
    if (!err) return false;
    if (err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FILE_COUNT") {
        res.status(413).json({ message: "Súbory sú príliš veľké alebo ich je priveľa." });
        return true;
    }
    res.status(400).json({ message: err.message || "Chyba pri nahrávaní súborov." });
    return true;
}

const uploadPhotos = (req, res, next) => {
    uploadDisk.array("photos", 50)(req, res, (err) => {
        if (handleMulterError(err, res)) return;
        next();
    });
};

// POST /
router.post('/', authenticate, authorize(["ADMIN", "TEACHER"]), uploadPhotos, async (req, res) => {
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

    try {
        const { schoolYear, eventName, classIds } = req.body;

        if (!schoolYear || !eventName || !classIds || !req.files || req.files.length === 0) {
            if (req.files) req.files.forEach(f => fs.unlinkSync(f.path));
            return res.status(400).json({ message: 'Chýba schoolYear, eventName alebo classIds' });
        }

        let classIdsArray = [];
        if (Array.isArray(classIds)) {
            classIdsArray = classIds.map(id => parseInt(id, 10));
        } else if (typeof classIds === 'string') {
            classIdsArray = classIds.split(',').map(id => parseInt(id.trim(), 10));
        } else {
            if (req.files) req.files.forEach(f => fs.unlinkSync(f.path));
            return res.status(400).json({ message: 'classIds musí byť pole alebo string' });
        }

        classIdsArray = classIdsArray.filter((id) => Number.isFinite(id));
        if (classIdsArray.length === 0) {
            if (req.files) req.files.forEach(f => fs.unlinkSync(f.path));
            return res.status(400).json({ message: 'Neplatné classIds' });
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

            const createdPhoto = await prisma.photo.create({
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
                id: createdPhoto.id,
                eventId: event.id,
                classIds: classIdsArray,
                faces: faces
            });
        }

        res.status(200).json({
            message: 'Fotky úspešne nahraté a komprimované!',
            count: processedFiles.length,
            files: processedFiles
        });
    } catch (err) {
        console.error("Photo upload failed:", err);
        return res.status(500).json({ message: "Chyba pri nahrávaní fotiek." });
    }
});


// POST /embedding
router.post("/embedding", authenticate, authorize(["ADMIN", "TEACHER"]), uploadMemory.array("photos", 5), async (req, res) => {
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
router.get('/event/:eventId', authenticate, async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { classes: { include: { class: true } } }
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const roleType = getRoleType(req.user);
    if (roleType === "PARENT") {
        const parentClassIds = await getParentClassIds(req.user?.id);
        const eventClassIds = event.classes.map((c) => c.classId);
        const hasAccess = eventClassIds.some((id) => parentClassIds.includes(id));
        if (!hasAccess) {
            return res.status(403).json({ message: "Nemáte prístup k tomuto albumu." });
        }
    }

    const photos = await prisma.photo.findMany({
        where: { eventId },
        include: { PhotoOnClass: { include: { class: true } } },
        orderBy: { createdAt: 'desc' }
    });

    const eventClassIds = event.classes.map((c) => c.classId);
    res.json({
        count: photos.length,
        photos,
        event: {
            id: event.id,
            name: event.name,
            schoolYear: event.schoolYear,
            classIds: eventClassIds
        }
    });
});

// GET /photos/class/:classId
router.get('/class/:classId', authenticate, async (req, res) => {
    const classId = parseInt(req.params.classId);

    const roleType = getRoleType(req.user);
    if (roleType === "PARENT") {
        const parentClassIds = await getParentClassIds(req.user?.id);
        if (!parentClassIds.includes(classId)) {
            return res.status(403).json({ message: "Nemáte prístup k tejto triede." });
        }
    }

    const photos = await prisma.photo.findMany({
        where: { PhotoOnClass: { some: { classId } } },
        include: { PhotoOnClass: { include: { class: true } }, event: true },
        orderBy: { createdAt: 'desc' }
    });

    res.json({ count: photos.length, photos });
});

// POST /photos/classes
router.post('/classes', authenticate, async (req, res) => {
    const { classIds } = req.body || {};
    let classIdsArray = Array.isArray(classIds) ? classIds : [];
    classIdsArray = classIdsArray.map((id) => parseInt(id, 10)).filter((id) => Number.isFinite(id));

    if (classIdsArray.length === 0) {
        return res.status(400).json({ message: "classIds must be a non-empty array." });
    }

    const roleType = getRoleType(req.user);
    if (roleType === "PARENT") {
        const parentClassIds = await getParentClassIds(req.user?.id);
        classIdsArray = classIdsArray.filter((id) => parentClassIds.includes(id));
        if (classIdsArray.length === 0) {
            return res.status(403).json({ message: "Nemáte prístup k týmto triedam." });
        }
    }

    const photos = await prisma.photo.findMany({
        where: { PhotoOnClass: { some: { classId: { in: classIdsArray } } } },
        include: { PhotoOnClass: true, event: true },
        orderBy: { createdAt: 'desc' }
    });

    const eventsMap = new Map();
    photos.forEach((photo) => {
        const eventId = photo.eventId;
        if (!eventsMap.has(eventId)) {
            eventsMap.set(eventId, { event: photo.event, photos: [] });
        }
        eventsMap.get(eventId).photos.push(photo);
    });

    res.json({ events: Array.from(eventsMap.values()) });
});

// GET /photos/:id
router.get('/:id', authenticate, async (req, res) => {
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

// DELETE /photos/:id
router.delete('/:id', authenticate, authorize(["ADMIN", "TEACHER"]), async (req, res) => {
    const id = parseInt(req.params.id);
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (photo.filePath && fs.existsSync(photo.filePath)) {
        try {
            fs.unlinkSync(photo.filePath);
        } catch (err) {
            console.warn("Failed to delete file:", photo.filePath, err?.message || err);
        }
    }

    await prisma.photo.delete({ where: { id } });
    res.json({ message: "Photo deleted" });
});

// PATCH /photos/event/:eventId
router.patch('/event/:eventId', authenticate, authorize(["ADMIN", "TEACHER"]), async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const { name, schoolYear, classIds } = req.body;

    if (!name || !schoolYear || !classIds) {
        return res.status(400).json({ message: "Missing name, schoolYear or classIds." });
    }

    let classIdsArray = [];
    if (Array.isArray(classIds)) {
        classIdsArray = classIds.map(id => parseInt(id));
    } else if (typeof classIds === 'string') {
        classIdsArray = classIds.split(',').map(id => parseInt(id.trim()));
    } else {
        return res.status(400).json({ message: 'classIds musí byť pole alebo string' });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const photos = await prisma.photo.findMany({
        where: { eventId },
        select: { id: true }
    });
    const photoIds = photos.map(p => p.id);

    await prisma.$transaction([
        prisma.event.update({
            where: { id: eventId },
            data: { name, schoolYear },
        }),
        prisma.eventOnClass.deleteMany({ where: { eventId } }),
        prisma.eventOnClass.createMany({
            data: classIdsArray.map(classId => ({ eventId, classId }))
        }),
        prisma.photoOnClass.deleteMany({ where: { photoId: { in: photoIds } } }),
        ...(photoIds.length > 0 ? [
            prisma.photoOnClass.createMany({
                data: photoIds.flatMap(photoId =>
                    classIdsArray.map(classId => ({ photoId, classId }))
                )
            })
        ] : [])
    ]);

    res.json({ message: "Album updated" });
});

// DELETE /photos/event/:eventId
router.delete('/event/:eventId', authenticate, authorize(["ADMIN", "TEACHER"]), async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const photos = await prisma.photo.findMany({
        where: { eventId },
        select: { id: true, filePath: true }
    });

    photos.forEach((photo) => {
        if (photo.filePath && fs.existsSync(photo.filePath)) {
            try {
                fs.unlinkSync(photo.filePath);
            } catch (err) {
                console.warn("Failed to delete file:", photo.filePath, err?.message || err);
            }
        }
    });

    await prisma.$transaction([
        prisma.photo.deleteMany({ where: { eventId } }),
        prisma.event.delete({ where: { id: eventId } })
    ]);

    res.json({ message: "Album deleted" });
});

module.exports = router;
