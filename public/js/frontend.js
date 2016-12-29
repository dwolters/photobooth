/* Configuration variables */
let delayTime = 300; // Delay between countdown steps
let fadeTime = 700; // Specifies the fade time for countdown steps, errors, the waiting, loading, and the smile screen.
let slideshowFadeTime = 3000; // Specifies the fading time of slideshow pictures
let slideshowTime = 8000; // Specifies how long a random picture is shown
let newPictureTime = 12000; // Specifies how long a newly taken picture is shown
let showStartPictureInterval = 5; // Interval until the start picture shall be shown. Set to 0 to disable start picture.
let slideshow = true; // Enables/Disables slide show

/* Internal variables - DO NOT ALTER */
// Countdown boxes to be shown
let countdown = ['#countdown3', '#countdown2', '#countdown1'];
// Indicates whether a picture is being taken
let running = false;
// All slideshow pictures (automatically filled by updateSlideshowPictures()
let pictures = [];
// Toggle defining if picture 1 or 2 should be shown
let slideshowToggle = true;
// Counter for the number of shown random pictures
let randomPictureCounter = 0;
// Active timeout
let timeoutHandle;
// Default picture path
let picDir = 'pictures/';

/**
 * Stops previous timeouts and sets a new timeout for the given callback.
 * @param {Function} callback Function to be called once the time has passed
 * @param {number} time Time until the callback should be invoked.
 */
function timeout(callback, time) {
    // Remove active timeouts
    clearTimeout(timeoutHandle);

    // Create new timeout
    timeoutHandle = setTimeout(callback, time);
}

/**
 * Gets a random picture for the slideshow.
 * @return {string} Path of the random picture
 */
function getRandomPicture() {
    // Periodically show the start picture
    if (showStartPictureInterval && randomPictureCounter++ % showStartPictureInterval == 0) {
        return 'gfx/start.png';
    }
    // Show start picture if slide show picutures are empty
    if(pictures.length === 0) {
        return 'gfx/start.png';
    }
    // Return random picture
    return picDir + pictures[Math.floor(Math.random() * pictures.length)];
}

/**
 * Show the countdown picture with the given index
 * @param {number} index Index of the countdown picture
 */
function runCountdown(index) {
    running = true;
    if(index === undefined) {
        index = 0;
    }
    if (index == countdown.length) {
        takePicture();
    } else {
        $(countdown[index])
            .delay(delayTime)
            .fadeOut(fadeTime, function() {
                runCountdown(index+1);
            });
    }
}

/**
 * Starts the countdown.
 */
function run() {
    if (!running) {
        $('#gallery img').show();
        $('#picture1').show();
        $('#picture2').show();
        runCountdown();
    }
}

/**
 * Display the error screen.
 * @param {Object} jqXHR jQuery ajax response object containing the error message
 */
function showError(jqXHR) {
    console.error(jqXHR.responseText);
    running = false;
    $('#picture1').attr('src', 'gfx/error.png');
    $('#picture1').show();
    $('#wait').hide();
    $('#smile').fadeOut(fadeTime);
    updateSlideshowPictures();
}

/**
 * Requests that the backend takes a picture.
 */
function takePicture() {
    $.get('/capture').then(function(file) {
        running = false;
        $('#smile').fadeOut(fadeTime);
        convertPicture(file);
    }, showError);
}

/**
 * Request that the backend converts the given file.
 * @param {string} file Name of the file to be converted
 */
function convertPicture(file) {
    $.get('/convert', {file: file, size: Math.ceil($('#gallery').width())}).then(function(convertedFile) {
        if (!running) {
            $('#picture1').attr('src', picDir + convertedFile);
            $('#picture2').attr('src', picDir + convertedFile);
            $('#wait').fadeOut(fadeTime);
            timeout(updateSlideshowPictures, newPictureTime);
        }
    }, showError);
}

/**
 * Changes to the next picture of the slideshow.
 */
function runSlideshow() {
    if (!running && slideshow) {
        if (slideshowToggle) {
            $('#picture1').fadeOut(slideshowFadeTime, function() {
                $('#picture1').attr('src', getRandomPicture());
                slideshowToggle = !slideshowToggle;
                timeout(runSlideshow, slideshowTime);
            });
        } else {
            $('#picture1').fadeIn(slideshowFadeTime, function() {
                $('#picture2').attr('src', getRandomPicture());
                slideshowToggle = !slideshowToggle;
                timeout(runSlideshow, slideshowTime);
            });
        }
    }
}

/**
 * Retrieves the pictures for the slideshow.
 */
function updateSlideshowPictures() {
    slideshowToggle = true;
    $.get('/list').then(function(data) {
        pictures = data;
        $('#picture2').attr('src', getRandomPicture());
        timeout(runSlideshow, slideshowTime);
    }, showError);
}

// Start slideshow and add event handlers when DOM is loaded.
$(function() {
    updateSlideshowPictures();
    $(document).click(run);
    $(document).keypress(run);
});
