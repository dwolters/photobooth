# Photobooth using Raspberry Pi, gphoto2, and epeg

Renting a Photobooth for an event like a wedding can be quite expensive, but building one yourself is relatively cheap. All you need:
- Raspberry Pi (any model B should be okay, but the newest models are much faster)
- [Camera supporting image capture via Gphoto2](http://gphoto.org/proj/libgphoto2/support.php)
- Monitor for showing the pictures
- A remote USB device as a trigger (Any presenter should do the job)

The photobooth works quite simple: A browser runs in fullscreen mode, showing all pictures that have been taken. Upon pressing any key on the keyboard (or on another input device),
a countdown is shown. At the end of this countdown, a picture is taken. Afterwards, this picture is shown for a short time span on the monitor until the slideshow resumes.

## Detailed Photobooth Working Process

Initially, the start picture is shown. Afterwards, the photobooth switches into slideshow mode (if enabled). If no picture has been taken yet, it remains on the start picture.
Otherwise it will randomly show previously taken pictures. If any key is pressed, a countdown will start: 3, 2, 1, Smile. The picture is being taken when the smile screen is shown. 
Depending on the speed of your RPi and your camera settings, it might take a moment until the picture is actually taken. When the picture has been taken and downloaded to the RPi, the photobooth switches to the wait screen. 
There, the picture is scaled to a lower resolution and afterwards shown on the screen.
It is possible to take a new picture, once the wait screen is shown. If the error screen is shown, either the picture could not be taken or the conversion failed. The former usually happens
when the camera is on stand-by, the battery is empty, or if the camera could not find a proper focus point. If everything works correctly, the scaled picture is shown for a certain time span and 
then the slideshow continues.

# Installation

## Raspbian

Install [Raspbian with Pixel](https://www.raspberrypi.org/downloads/raspbian/) on your Raspberry Pi. Login as `pi` with password `raspberry` and update your everything by running:

```sh
sudo apt-get update
sudo apt-get upgrade
```

Run `raspi-config`, expand the filesystem and enable boot to desktop with autologin.

If you are installing the photobooth remotely via SSH, you should use screen for running the other installation commands. Install screen by running `sudo apt-get install screen`. Then run `screen` so that your session remains open even if your network connection is interrupted. If you need to reconnect to your RPi, simply run `screen -r` to reattach to the previously opened screen.

_Please note_: [SSH is disabled by default in the newest Raspbian version](https://www.raspberrypi.org/blog/a-security-update-for-raspbian-pixel/). Add a blank file called `ssh` to the boot directory to enable SSH.

*Important*: Change the password of the user `pi`, especially if your connect it to the internet! Open a terminal and run `passwd` to change the password.

## Auxiliary packages

Install auxiliary packages needed to compile gphoto2 and epeg:

```sh
sudo apt-get install libtool libexif-dev automake libjpeg-dev
```

### Gphoto2

Gphoto2 is used to remotely control various different cameras, e.g., DSLRs from Nikon or Canon. To install it, we use the great [gphoto2 installer from gonzalo](https://github.com/gonzalo/gphoto2-updater):

```sh
wget https://raw.githubusercontent.com/gonzalo/gphoto2-updater/master/gphoto2-updater.sh
chmod +x gphoto2-updater.sh
sudo ./gphoto2-updater.sh
rm gphoto2-updater.sh
```

Warning: This might take a while. If you use SSH, use screen (see above).

Check whether or not gphoto2 can capture pictures using your camera. Therefore, connect the USB cable of your camera to the RPi and run the following commands:

```sh
# Check if your camera is recognized
gphoto2 --auto-detect 

# Check if image capture is supported
gphoto2 --abilities

# Capture and download a picture 
gphoto2 --capture-image-and-download --filename=test.jpg
```

If your camera properly takes a picture, it should download and stored under the filename `test.jpg` on the RPi. If not, try another USB mode of your camera.


### epeg

For the fast conversion of images to a lower resolution, we need to install epeg:

```sh
# Download, build, and install epeg
wget https://github.com/mattes/epeg/archive/master.zip
unzip master.zip
cd epeg-master
./autogen.sh
make
sudo make install
sudo ldconfig
# Verfiy that epeg is installed correctly
epeg
# Clean up
cd ..
rm -R epeg-master
rm master.zip
```

### Chromium

Chromium is installed on Raspbian with PIXEL. On older version, you might need to install chromium as well.

### Node.js

Node.js is preinstalled on the newest raspbian versions, but the version is very old. Thus, we remove the old version and install an up-to-date one.

```sh
sudo apt-get remove -y nodejs
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Install Photobooth

*Important*: We assume that the user `pi` runs the photobooth software and that the software will be located in `/home/pi/photobooth`. 
If you want to change this location or the user, please also change all paths in the files `photobooth/photobooth.desktop`, `photobooth.service`, and `kiosk.sh` accordingly.

```
cd ~
git clone https://github.com/dwolters/photobooth.git
cd photobooth 
# Install dependencies
npm install
# Make the webserver executable
chmod +x photobooth.js
# Make the script to start the browser executable
chmod +x misc/kiosk.sh
```

If you want to start the photobooth manually, you can run `./photobooth.js` to start the backend and open http://localhost:8080/ to see the frontend. 
The following commands are needed, to setup the RPi to directly start the photobooth upon system start.

First, we register the backend as a service, so that it is automatically started.
```sh
sudo cp ~/photobooth/misc/photobooth.service /etc/systemd/system/
sudo systemctl enable photobooth
```

To start the service, reboot or run:
```sh
sudo systemctl start photobooth
```

If you want to check the output of the service, run `sudo journalctl -u photobooth`

Additionally, the browser (chromium) shall automatically be started in fullscreen mode with the frontend URL. Therefore, we put a script into the autostart of the desktop system.
```sh
# Check if ~/.config/autostart exists. If not, create it before running the next command.
cp ~/photobooth/misc/photobooth.desktop ~/.config/autostart/
```

If the RPi is set to boot to desktop with autologin (can be set via `raspi-config`), it should directly start the Photobooth. This comes in very handy, 
since you can simply restart the Photobooth by unplugging it.

# Configuration
The backend can be configured by altering the `config.json` file. Configuration variables for the frontend can be found at the beginning of the `frontend.js` file in the `public/js/` directory.

# Customization
The frontend can be customized by replacing the images in the `public/gfx/` directory. You can specify your own countdown, smile, wait, error, and start pictures. You can also manipulate the HTML of the `index.html`, e.g., by adding a border around the `#gallery` div. Avoid changing anything inside the `#gallery` div, since this might lead to problems with the JavaScript. Be sure, to test the photobooth properly after changing the HTML. 

# Troubleshooting

## Gphoto2 supports my camera but I cannot take a picture

Some cameras support multiple different USB modes, e.g., one for remote controlling the camera and another one to use it as a mass storage device. Switch to another USB mode and try using gphoto2 again.
 
## After a while, I cannot take any new picture and the photobooth only displays 'error'

Be sure that the RPi has enough power. If the RPi does not have enough power, it might lose the connection to the camera. A current of at least 2.5A is recommended. Furthermore, disable the stand-by mode of your camera. Depending on your Gphoto2 and raspbian version, the file system of your camera maybe mounted automatically. To avoid that, remove the following files:

```sh
rm /usr/share/dbus-1/services/org.gtk.Private.GPhoto2VolumeMonitor.service 
rm /usr/share/gvfs/mounts/gphoto2.mount 
rm /usr/share/gvfs/remote-volume-monitors/gphoto2.monitor 
rm /usr/lib/gvfs/gvfs-gphoto2-volume-monitor
```

## A small rainbow-colored rectangle is shown on the screen

Your RPi does not have enough power! Use a power supply providing a current of at least 2.5A.

## Not every key triggers the capturing of a new picture

Unfortunately JavaScript does not recognize any key as an input key. To include not recognized keys as well, map their keycode to another key, i. e., return key. You find an example in the `kiosk.sh` file. Please note, that this mapping is system-wide, meaning the key is mapped to the new code for all applications!
