const express = require('express');
const config = require('../config.json');
const path = require('path');
const exec = require('child_process').exec;

let router = express.Router();

let picDir = path.resolve(config.picturesDir);
let smallPicDir = path.resolve(config.smallPicturesDir);
let smallPrefix = config.smallPrefix;

/**
 * Creates a picture with a lower resolution.
 * @param {string} filename Filename of the picture to be scaled
 * @param {number} size Maximum size of the image in pixel
 * @return {Promise} Resolves to the filename of the scaled image
 */
function convert(filename, size) {
    return new Promise((resolve, reject) => {
        let cmd = 'epeg --max=' + size + ' ' + path.join(picDir, filename) + ' ' + path.join(smallPicDir, smallPrefix + filename);
        console.log('epeg command:', cmd);
        exec(cmd, (error, stdout, stderr) => {
            if (stdout) {
                console.log('Standard Output:', stdout);
            }
            if (error) {
                if(stderr) {
                    console.error('Error Output:', stderr);
                }
                reject(error);
            } else {
                resolve(smallPrefix + filename);
            }
        });
    });
}

router.get('/', (req, res) => {
    let filename = req.query.file;
    let size = req.query.size;
	console.log('size:', size);
    convert(filename, size)
        .then((filename) => res.end(filename))
        .catch((err) => {
            console.log('Error while converting picture:', err);
            res.status(500).end(err.message);
        });
});

module.exports = router;
