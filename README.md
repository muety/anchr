<p align="center">
  <img src="public/app/images/logo.png" height="128px">
</p>

<h1 align="center">Anchr</h1>
<h3 align="center">Anchr is a small toolbox for common tasks on the internet, including <strong>bookmarks</strong>, <strong>link shortening</strong> and <strong>image uploads</strong>.</h3>

<p align="center">
    <img src="https://badges.fw-web.space/github/license/muety/anchr?style=flat-square">
    <img src="https://badges.fw-web.space/github/package-json/v/muety/anchr?style=flat-square">
    <img src="https://badges.fw-web.space/github/languages/code-size/muety/anchr">
    <a href="https://liberapay.com/muety/" target="_blank"><img src="http://badges.fw-web.space/liberapay/receives/muety.svg?logo=liberapay&style=flat-square"></a>
</p>

## 🚀 Features
* Link shortener
* Searchable bookmarks collections
* Encrypted images uploads, using [CryptoJS](https://www.npmjs.com/package/crypto-js)
* Malicious link checking, using [Safe Browsing API](https://developers.google.com/safe-browsing/)
* Self-hosted and open-source
* Hosted, GDPR-compliant service at [Anchr.io](https://anchr.io)
* Official [Android app](https://github.com/muety/anchr-android)
* Chrome and Firefox [browser extension](webext)
* [Prometheus](https://prometheus.io) metrics
* Integration with [ShareX](https://github.com/ShareX/ShareX)
* OAuth 2 authentication (Google, Facebook, ...)
* Telegram Bot ([@AnchrBot](https://t.me/AnchrBot))

**If you like this project, please [consider sponsoring it](https://muetsch.io/consider-sponsoring-open-source.html)!**

## 🗒 Description
The idea arose when someday I considered it useful to have a collection of web links or bookmarks – like those you have in Chrome or Firefox – accessible from anywhere without needing to synchronize your browser profile. Just like if you’re somewhere on another PC, find a useful article on the internet and want to save it quickly for later at home. This is what Anchr’s __collections__ feature does. It saves links – with an optional description for easier search and separated into categories / collections.

The second feature is to __upload images__. You can easily upload one or more photos from your computer or mobile device and send them to friends or include them into forum posts or the like. Special with Anchr’s image hosting is that users are given the opportunity to client-sided encrypt images with a password. As a result no one without the password will ever see their photos’ content.

The last feature are __shortlinks__ – actually not any different from those you know from goo.gl or bit.ly. They’re useful if you have a very long web link including many query parameters, access tokens, session ids, special characters and the like and want to share them. Often special characters break the linking or your chat application has a maximum length for hyperlinks. Or you just want to keep clarity in your document or emails. In this case it can be very helpful to make the links as short as any possible. Additionally, shortlinks are checked against [Google's Safe Browsing API](https://developers.google.com/safe-browsing/) to prevent your site to reference phishing sites or the like.

Anchr’s focus is on ease and quickness of use – short loading times, flat menu hierarchies, etc. There's also a Chrome extension out there, which you can use to save or shorten links directly from the website.

## 📡 How to run?
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
    * `ANCHR_VERIFY_USERS`: Whether require new users to activate their accounts with an e-mail link (requires mailing) (default: `true`)
    * `ANCHR_BASIC_AUTH`: Whether to allow authenticating using [HTTP Basic Auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes) (default: `true`)
    * `ANCHR_EXPOSE_METRICS`: Whether to expose [Prometheus](https://prometheus.io) metrics under the public `/api/metrics` endpoint (default: `false`)
    * `ANCHR_MAIL_SENDER`: Sender address in mails from Anchr.io (default: `Anchr.io <noreply@anchr.io>`)
    * `ANCHR_SMTP_HOST`: SMTP server host for sending mails (leave empty to disable mailing)
    * `ANCHR_SMTP_PORT`: SMTP server port (default: `587`)
    * `ANCHR_SMTP_TLS`: Whether to establish a TLS connection with the SMTP server (not to be confused with STARTTLS) (default: `false`)
    * `ANCHR_SMTP_USER`: SMTP server login username
    * `ANCHR_SMTP_PASS`: SMTP server login password
    * `ANCHR_MAILWHALE_URL`: Public URL of your [MailWhale](https://github.com/muety/mailwhale) instance when using it for mails instead of SMTP (default: `https://mailwhale.dev`)
    * `ANCHR_MAILWHALE_CLIENT_ID`: MailWhale client ID for authentication
    * `ANCHR_MAILWHALE_CLIENT_SECRET`: MailWhale client secret for authentication
    * `ANCHR_TELEGRAM_BOT_TOKEN`: Telegram bot token (from [@BotFather](https://t.me/BotFather)). Leave empty for disabling Telegram integration.
    * `ANCHR_TELEGRAM_URL_SECRET`: Secret to append to Telegram webhook path for security purposes. Can be any random string.

### ⚙️ Run
#### Setup
1. `$ source env.sh`
3. `$ yarn`
4. `$ cd public && ../node_modules/.bin/bower install && cd ..`
   
#### Option 1: Run Natively
##### For development
1. Run backend `$ yarn start`
2. Run frontend `$ yarn start:frontend`
3. Go to http://localhost:9000 and enjoy live reload

##### In production
1. `$ yarn run build` (to build frontend)
2. `$ yarn run production`

#### Option 2: Run with Docker
1. `source env.sh`
1. `docker-compose up`

### 🤖 Telegram Bot Setup
1. Create a new bot with [@BotFather](https://t.me/BotFather)
1. Configure `ANCHR_TELEGRAM_BOT_TOKEN` and `ANCHR_TELEGRAM_URL_SECRET` variables
1. Configure the webhook:
```bash
curl https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<ANCHR_URL>/api/telegram/updates/<URL_SECRET>
```

## 🧰 Tooling
### [ShareX](https://github.com/ShareX/ShareX) (Windows only)
You can integrate Anchr with [ShareX](https://github.com/ShareX/ShareX) on Windows and make it be used as a custom target for **image uploads** and **shortlinks**.
1. Generate an HTTP basic auth hash Base64 hash of `youremail@example.org:yourpassword`
    * **Option 1 (Linux):** `echo "youremail@example.org:yourpassword" | base64`
    * **Option 2:** Use an [online tool](https://www.base64encode.net/)
1. Insert your newly generated hash in
    * [`sharex-images.json`](scripts/sharex-images.json) and
    * [`sharex-shortlinks.json`](scripts/sharex-shortlinks.json)
1. Import both files as custom uploaders in ShareX

## 🧩 Project History
The project's origins lie in 2014, back when the [MEAN stack](https://www.mongodb.com/mean-stack) was the sh*t. It was the author's first real web project and a great opportunity to learn. The project is maintained ever since, however, considered mostly feature-complete. Dependencies are updated occasionally. Because the project started quite a couple of years ago, some parts are still based on old-fashioned JavaScript ES5 syntax, alongside vintage tools like [Grunt](https://gruntjs.com/) and [Bower](https://bower.io/). Certainly, this is not state-of-the-art in web dev anymore. However, to keep consistency with existing code, the original code style should still be followed in new contributions. **Update:** Just [recently](https://github.com/muety/anchr/issues/54), all backend-side code was refactored to modern JavaScript syntax to ease development. 

## 📓 License
GNU General Public License v3 (GPL-3) @ [Ferdinand Mütsch](https://muetsch.io)
