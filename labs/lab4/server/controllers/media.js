const MediaRepository = require('../../repositories/mediaRepository');
const mediaRepository = new MediaRepository();


module.exports = {
    getPicture(req, res) {
        const id = req.params.id;
        const mediaProm = mediaRepository.getMediaById(id);
        mediaProm.then(media=>{
                res.set("Content-type", "application/json");
                res.send(media);
        }).catch(err=>{
            res.status(404).send({});
        });
    },
    addPicture(req, res) {
        // console.log(req.files);
        const mimetype = req.files.image.mimetype;
        const type = mimetype.slice(mimetype.lastIndexOf('/')+1);
        mimetype.lastIndexOf('/');
        const ans = mediaRepository.uploadRaw(req.files.image.data, type);
        ans.then(ans =>{
            res.send(ans);
        })
            .catch(err=>{
                res.send(err);
            });
    }
};