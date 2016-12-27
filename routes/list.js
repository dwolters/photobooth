const express = require('express');
const fs = require('fs-promise');
const config = require('../config.json');
const path = require('path');

let router = express.Router();
let smallPicDir = path.resolve(config.smallPicturesDir);
let smallPrefix = config.smallPrefix;

/**
 * Lists all scaled pictures.
 * @return {Promise} Resolves to a list of scaled pictures
 */
function listSmallPictures() {
    return fs.readdir(smallPicDir)
        .then((files) => files.filter((file) => file.match(smallPrefix)));
}

router.get('/', (req, res) => {
    listSmallPictures()
        .then((files) => res.json(files))
        .catch((err) => {
            console.error('Error while listing small pictures:', err);
            res.status(500).json([]);
        });
});

module.exports = router;
