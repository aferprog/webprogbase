const express = require("express");
const multer = require('multer');
const mediaController = require('./controllers/media');
const upload = multer({
    storage: mediaController.storage,
});
const mustache = require("mustache-express");
const router = require("./routes/api");
// const busboyBodyParser = require('busboy-body-parser');
const path = require('path');
const bodyParser = require("body-parser");
const busboy = require('connect-busboy');

const app = express();

const viewsPath=path.join(__dirname, 'views');
const partialsPath=path.join(viewsPath, 'partials');

app.engine('mst', mustache(partialsPath));
app.set('views', viewsPath);
app.set('view engine', 'mst');
app.get('/', function(req,res){
    res.render('index');
});

app.use(express.static("./data"));

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/wepons', upload.single('image') );
app.post('/serials', bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(busboy()); 

app.use(express.static("./public"));
app.use("/", router);

const expressSwaggerGenerator = require('express-swagger-generator');
const expressSwagger = expressSwaggerGenerator(app);
 
const options = {
    swaggerDefinition: {
        info: {
            description: 'Working with Users and Wepons',
            title: 'LABA 2',
            version: '1.0.0',
        },
        host: 'localhost:3000',
        produces: [ "application/json" ],
    },
    basedir: __dirname,
    files: ['./routes/**/*.js', '../models/**/*.js'],
};
expressSwagger(options);


app.listen(3000, ()=>{console.log("Server is ready");});