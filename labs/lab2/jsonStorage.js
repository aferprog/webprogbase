const fs=require('fs');
class JsonStorage {

    // filePath - path to JSON file
    constructor(filePath) {
        this.filePath=filePath;
    }

    get nextId() {
        const jsonText = fs.readFileSync(this.filePath);
        const jsonObj = JSON.parse(jsonText);
        return jsonObj.nextId;
    }

    incrementNextId() {
        const jsonText = fs.readFileSync(this.filePath);
        let jsonObj = JSON.parse(jsonText);
        jsonObj.nextId++;
        const newJsonText = JSON.stringify(jsonObj, null, 2);
        fs.writeFileSync(this.filePath, newJsonText);
    }

    readItems() {
        const jsonText = fs.readFileSync(this.filePath);
        const jsonObj = JSON.parse(jsonText);
        return jsonObj.items;
    }

    writeItems(items) {
        const jsonText = fs.readFileSync(this.filePath);
        let jsonObj = JSON.parse(jsonText);
        jsonObj.items=items;
        const newJsonText = JSON.stringify(jsonObj, null, 2);
        fs.writeFileSync(this.filePath, newJsonText);
    }
};

module.exports = JsonStorage;