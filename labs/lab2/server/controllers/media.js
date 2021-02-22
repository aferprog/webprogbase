const MediaRepository = require('../../repositories/mediaRepository');
const mediaRepository = new MediaRepository('./data/media');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, mediaRepository.getPath)
    },
    filename: function (req, file, cb) {
        const fileFormat = file.mimetype.split('/')[1];
        cb(null, String(mediaRepository.getNextId())+"."+fileFormat);
    }
});
const upload = multer({ storage: storage }).any();

module.exports = {
    getPicture(req, res) {
        try
        {
            const picturePath = mediaRepository.getPicturePath(req.params.id);
            if (!picturePath && !isNaN(req.params.id))
            {
                res.status(404).send({ message: 'Picture not found' });
            }
            else if (!picturePath)
            {
                res.status(400).send({ message: 'Bad request' });
            }
            else
            {
                res.status(200).sendFile(picturePath, { root: '.' });
            }
        }
        catch(err)
        {
            console.log('err ', err.message);
            res.status(500).send({ pictureId: null, message: 'Server error' });
        }
    },
    addPicture(req, res) {
        upload(req, res, (err) => {
            if (err) {
                console.log('err ', err.message);
                res.status(500).send({ pictureId: null, message: 'Server error' });
            } else if (req.files) {
                const fileFormat = req.files[0].mimetype.split('/')[1];
                if (!mediaRepository.getFormats().includes(fileFormat))
                {
                    res.status(400).send({ message: 'Bad request' });
                    return;
                }
                res.status(201).send({ pictureId: mediaRepository.getNextId(), message: 'Picture has been uploaded' })
                mediaRepository.incrementNextId();
            } else {
                res.status(400).send({ message: 'Bad request' });
            }
        })
    }
};