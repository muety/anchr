# Anchr - Image uploads, bookmarks and shortlink service

![GitHub package.json version](https://badges.fw-web.space/github/package-json/v/muety/anchr?style=flat-square)
[![](http://badges.fw-web.space/liberapay/receives/muety.svg?logo=liberapay&style=flat-square)](https://liberapay.com/muety/)
[![Say thanks](https://badges.fw-web.space/badge/SayThanks.io-%E2%98%BC-1EAEDB.svg?style=flat-square)](https://saythanks.io/to/n1try)
![](https://badges.fw-web.space/github/license/muety/anchr?style=flat-square)
[![](https://badges.fw-web.space/website.svg?url=https%3A%2F%anchr.io%2Fhealth&style=flat-square)](https://anchr.io)

[![Buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoff.ee/n1try)

---

Anchr is a useful little helper or toolbox or the like for common tasks on the internet. It comes with an [Android App](https://github.com/muety/anchr-android) for Anchr link collections.

<img src="https://anchr.io/images/logo.png" height="128px">

## 🗒 What does it do?
The idea arised when someday I considered it useful to have a collection of web links or bookmarks – like those you have in Chrome or Firefox – accessible from everywhere without needing to synchronize your browser profile. Just like if you’re anywhere on an other PC, find a useful article on the internet and want to save it quickly for later at home. This is what Anchr’s __collections__ feature does. It saves links – with an optional description for easier search and separated into seperate categories / collections.

The second feature is to __upload images__. You can easily upload one or more photos from your computer oder mobile device and send them to friends or include them into forum posts or the like. Special with Anchr’s image hosting is that users are given the opportunity to client-sided encrypt images with a password. As a result no one without the password will ever see their photos’ content.

The last feature are __shortlinks__ – actually not any different from those you know from goo.gl or bit.ly. They’re useful if you have a very long web link including many query parameters, access tokens, session ids, special characters and the like and want to share them. Often special characters break the linking or your chat application has a maximum length for hyperlinks. Or you just want to keep clarity in your document or emails. In this case it can be very helpful to make the links as short as any possible. Additionally, shortlinks are checked against [Google's Safe Browsing API](https://developers.google.com/safe-browsing/) to prevent your site to reference phishing sites or the like.

Anchr’s focus is on ease and quickness of use – short loading times, flat menu hierarchies, etc. There's also a Chrome extension out there, which you can use to save or shorten links directly from the website.

## 📡 How to host it myself?
### Prerequisites
In order to host Anchr on your own, you need a few things.
* Node.js 12.x
* A MongoDB 3.4 database (you can use [mlab.com](http://mlab.com) to get a free, hosted MongoDB)
* Optionally, but recommended: A webserver as a reverse proxy (e.g. nginx) to enable compression and SSL encryption

### Configuration
1. `$ git clone https://github.com/muety/anchr`
2. Copy `.env.example` to `.env` and edit the contents to set environment variables:
    * `PORT`: TCP port to start the server on (default: `3000`)
    * `LISTEN_ADDR`: IPv4 address to make the server listen on (default: `127.0.0.1`)
    * `ANCHR_DB_USER`: MongoDB user name (default: `anchr`)
    * `ANCHR_DB_PASSWORD`: MongoDB password (**required**)
    * `ANCHR_DB_HOST`: MongoDB host name (default: `localhost`)
    * `ANCHR_DB_PORT`: MongoDB port (default: `27017`)
    * `ANCHR_DB_NAME`: MongoDB database name (default: `anchr`)
    * `ANCHR_UPLOAD_DIR`: Absolute path to a file system directory (must exist!) to persist uploaded images to (default: `/var/data/anchr`)
    * `ANCHR_SECRET`: A (preferably long), random character sequence to be used for the JSON Web Token (default: `shhh`)
    * `ANCHR_LOG_PATH`: Absolute file path for access logs (directory must exist!) (default:  `/var/log/anchr/access.log`)
    * `ANCHR_ERROR_LOG_PATH`: Absolute file path for error logs (directory must exist!) (default: `/var/log/anchr/error.log`)
    * `ANCHR_GOOGLE_API_KEY`: Your API key for Google APIs (required for safe browse checking incoming shortlinks), which you get from the [Developers Console](https://console.developers.google.com/apis/) (default: `''`, leave blank to disable safe browse checking)
    * `ANCHR_FB_CLIENT_ID` and `ANCHR_FB_SECRET`: OAuth credentials for Facebook Login (default: `''`, leave blank to disable Facebook login)
    * `ANCHR_GOOGLE_CLIENT_ID` and `ANCHR_GOOGLE_SECRET`: OAuth credentials for Google Login (default: `''`, leave blank to disable Google login)
    * `ANCHR_ALLOW_SIGNUP`: Whether to allow sign up of new users (default: `true`)
    * `ANCHR_BASIC_AUTH`: Whether to allow authenticating using [HTTP Basic Auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes) (default: `true`)
    * `ANCHR_EXPOSE_METRICS`: Whether to expose [Prometheus](https://prometheus.io) metrics under the public `/api/metrics` endpoint (default: `false`)

### ⚙️ Run
#### Setup
1. `$ source env.sh`
3. `$ yarn`
4. `$ cd public && ../node_modules/.bin/bower install && cd ..`
   
#### Option 1: Run Natively
##### For development
1. Run backend `$ yarn start` (from root folder)
2. Run frontend `$ ../node_modules/.bin/grunt serve` (from `public` folder)
3. Go to http://localhost:9000 and enjoy live reload

##### In production
1. `$ yarn run build` (to build frontend)
2. `$ yarn run production`

#### Option 2: Run with Docker
1. `source env.sh`
1. `docker-compose up`

## 🧩 Project State
This project is still maintained, but considered feature-complete. Dependencies are updated occasionally. Since the project started in 2014, the out-dated JavaScript ES5 syntax is used alongside tools like Grunt and Bower, which are not considered state-of-the-art in web dev anymore. However, to keep consistency with existing code, the original code style should still be followed in new contributions. Please don't use `const` and `let`, template string, arrow functions, `async / await` etc.

## 📓 License
GNU General Public License v3 (GPL-3) @ [Ferdinand Mütsch](https://muetsch.io)
