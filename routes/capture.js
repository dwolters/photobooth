const express = require('express');
const isFile = require('is-file').sync;
const config = require('../config.json');
const path = require('path');
const exec = require('child_process').exec;


let router = express.Router();

let nextId = 1;
let picDir = path.resolve(config.picturesDir);
let smallPicDir = path.resolve(config.smallPicturesDir);
let smallPrefix = config.smallPrefix;

/**
 * Creates a filename for the next picture. It ensures that neither the file nor a small version of the picture exists.
 * @return {string} Filename for the next picture
 */
function createFilename() {
    let filename = nextId + '.jpg';
    while (isFile(path.join(picDir, filename) || isFile(path.join(smallPicDir, smallPrefix + filename)))) {
        console.log('Skipping filename:', filename);
        nextId++;
        filename = nextId + '.jpg';
    }
    return filename;
}


/**
 * Captures a picture using gphoto2.
 * @return {Promise} Resolves to the filename of the captured picture
 */
function capture() {
    return new Promise((resolve, reject) => {
        let filename = createFilename();
        console.log('Taking Picture');
        let cmd = 'gphoto2 --capture-image-and-download --filename="' + path.join(picDir, filename) + '"';
        console.log('gphoto2 command:', cmd);
        exec(cmd, (error, stdout, stderr) => {
            if (stdout) {
                console.log('Standard Output: ' + stdout);
            }
            if (error) {
                if(stderr) {
                    console.error('Error Output:', stderr);
                }
                reject(error);
            } else {
                resolve(filename);
            }
        });
    });
}

router.get('/', (req, res) => {
    capture()
        .then((filename) => res.end(filename))
        .catch((err) => {
            console.log('Error while capturing picture', err);
            res.status(500).end(err.message);
        });
});

module.exports = router;
