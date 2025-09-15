import multer from "multer"
import path from "path"
import fs from "fs"

// Ensure uploads folder exists
const uploadDir = "uploads/"
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
}

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
        cb(null, uniqueName)
    },
})

// File filter (only images)
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|mov|avi/
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.test(ext)) {
        cb(null, true)
    } else {
        cb(new Error("Only images are allowed"), false)
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter,
})

export default upload
