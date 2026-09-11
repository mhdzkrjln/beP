const multer = require('multer')
const path = require('path')
const crypto = require('crypto')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'))
    },

    filename: (req, file, cb) => {
        const randomName = crypto.randomUUID();
        const ext = path.extname(file.originalname).toLowerCase()
        const name = randomName + ext
        cb(null, name)
    }
})

module.exports = multer({storage})