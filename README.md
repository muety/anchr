# Anchr - Image uploads, bookmarks and shortlink service

[![Buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoff.ee/n1try)

Anchr is a useful little helper or toolbox or the like for common tasks on the internet. It comes with an [Android App](https://github.com/n1try/anchr-android) for Anchr link collections.

ℹ️ The official hosted version, formerly available at [anchr.io](https://anchr.io), has been **discontinued**. To use Anchr, you will need you own, self-hosted instance from now on.

🛡 This software is not actively maintained anymore. Several dependencies are outdated and potentially vulnerable. We recommend to not expose your Anchr instance to the public internet.

![](https://anchr.io/i/9w5si.png)

## 🗒 What does it do?
The idea arised when someday I considered it useful to have a collection of web links or bookmarks – like those you have in Chrome or Firefox – accessible from everywhere without needing to synchronize your browser profile. Just like if you’re anywhere on an other PC, find a useful article on the internet and want to save it quickly for later at home. This is what Anchr’s __collections__ feature does. It saves links – with an optional description for easier search and separated into seperate categories / collections.

The second feature is to __upload images__. You can easily upload one or more photos from your computer oder mobile device and send them to friends or include them into forum posts or the like. Special with Anchr’s image hosting is that users are given the opportunity to client-sided encrypt images with a password. As a result no one without the password will ever see their photos’ content.

The last feature are __shortlinks__ – actually not any different from those you know from goo.gl or bit.ly. They’re useful if you have a very long web link including many query parameters, access tokens, session ids, special characters and the like and want to share them. Often special characters break the linking or your chat application has a maximum length for hyperlinks. Or you just want to keep clarity in your document or emails. In this case it can be very helpful to make the links as short as any possible. Additionally, shortlinks are checked against [Google's Safe Browsing API](https://developers.google.com/safe-browsing/) to prevent your site to reference phishing sites or the like.

Anchr’s focus is on ease and quickness of use – short loading times, flat menu hierarchies, etc. There's also a Chrome extension out there, which you can use to save or shorten links directly from the website.

## 📡 How to host it myself?
### Prerequisites
In order to host Anchr on your own, you need a few things.
* Node.js 8.x
* A MongoDB 3.4 database (you can use [mlab.com](http://mlab.com) to get a free, hosted MongoDB)
* Optionally, but recommended: A webserver as a reverse proxy (e.g. nginx) to enable compression and SSL encryption

### Configuration
1. `$ git clone https://github.com/n1try/anchr`
2. Copy `.env.example` to `.env` and edit the contents to set environment variables:
    * `PORT`: TCP port to start the server on (default: `3000`)
    * `ANCHR_DB_URL`: Connection URL to MongoDB (default: `mongodb://localhost:27017/anchr`)
    * `ANCHR_UPLOAD_DIR`: Absolute path to a file system directory (must exist!) to persist uploaded images to (default: `/var/data/anchr`)
    * `ANCHR_SECRET`: A (preferably long), random character sequence to be used for the JSON Web Token (default: `shhh`)
    * `ANCHR_LOG_PATH`: Absolute file path for access logs (directory must exist!) (default:  `/var/log/anchr/access.log`)
    * `ANCHR_ERROR_LOG_PATH`: Absolute file path for error logs (directory must exist!) (default: `/var/log/anchr/error.log`)
    * `ANCHR_GOOGLE_API_KEY`: Your API key for Google APIs (required for safe browse checking incoming shortlinks), which you get at the [Developers Console](https://console.developers.google.com/apis/)
    * `ANCHR_FB_CLIENT_ID` and `ANCHR_FB_SECRET`: OAuth credentials for Facebook Login
    * `ANCHR_GOOGLE_SECRET` and `ANCHR_GOOGLE_API_KEY`: OAuth credentials for Google Login
    * `ANCHR_ALLOW_SIGNUP`: Whether or not to allow sign up of new users (default: `true`)

### ⚙️ Run
#### Setup
1. `$ source env.sh`
2. `$ yarn global add bower`
3. `$ yarn`
4. `$ cd public && bower install && cd ..`
   
#### Option 1: Run Natively
##### For development
1. Run backend `$ yarn start` (from root folder)
2. Run frontend `$ grunt serve` (from `public` folder)
3. Go to http://localhost:9000 and enjoy live reload

##### In production
1. `$ yarn run build` (to build frontend)
2. `$ yarn run production`

#### Option 2: Run with Docker
1. `docker-compose up`

**NOTE:** The current Docker Compose configuration does not include spinning up the MongoDB database (see [#10](https://github.com/n1try/anchr/issues/10)). It is assumed that a Mongo instance is already running and accessible publicly. 

## 📓 License
GNU General Public License v3 (GPL-3) @ [Ferdinand Mütsch](https://muetsch.io)
