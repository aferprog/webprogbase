const JsonStorage = require('../jsonStorage');
const fs = require('fs');

class MediaRepository {
 
    constructor(filePath) {
        this.storage = new JsonStorage(filePath+'.json');
        this.folderPath = filePath;
    }
    get getPath()
    {
        return this.folderPath;
    }
    getPicturePath(id)
    {
        for (const format of this.getFormats())
        {
            const path = this.folderPath + '/' + id + '.' + format;
            if (fs.existsSync(path))
            {
                return path;
            }
        }
        return undefined;
    }

    getFormats()
    {
        return this.storage.readItems();
    }

    getNextId()
    {
        return this.storage.nextId;
    }

    incrementNextId()
    {
        this.storage.incrementNextId();
    }
};
 
module.exports = MediaRepository;