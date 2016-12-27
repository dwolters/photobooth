const express = require('express');
const config = require('../config.json');
const path = require('path');
const exec = require('child_process').exec;

let router = express.Router();

let picDir = path.resolve(config.picturesDir);
let smallPicDir = path.resolve(config.smallPicturesDir);
let smallPrefix = config.smallPrefix;
let maxSize = config.maxSize;

/**
 * Creates a picture with a lower resolution.
 * @param {string} filename Filename of the picture to be scaled
 * @return {Promise} Resolves to the filename of the scaled image
 */
function convert(filename) {
    return new Promise((resolve, reject) => {
        let cmd = 'epeg --max=' + maxSize + ' ' + path.join(picDir, filename) + ' ' + path.join(smallPicDir, smallPrefix + filename);
        console.log('epeg command:', cmd);
        exec(cmd, (error, stdout, stderr) => {
            if (stdout) {
                console.log('Standard Output:', stdout);
            }
            if (error) {
                console.log('Error while converting picture:', error);
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
    let filename = req.query.file; // must be extracted from the request
    convert(filename)
        .then((filename) => res.end(filename))
        .catch(() => res.status(500).end('error'));
});

module.exports = router;
