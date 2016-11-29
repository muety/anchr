# Anchr - Image uploads, bookmarks and shortlink service

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RTBP64PZDPDZW)

Anchr is a useful little helper or toolbox or the like for common tasks on the internet. The official hosted version is available at [anchr.io](https://anchr.io). There's also a [Chrome extension](https://anchr.io/s/tzYcr) for the official Anchr.io as well as a [ScreenCloud upload script](https://ferdinand-muetsch.de/anchrio-screencloud-script-for-windows.html) for Windows.

![](https://anchr.io/i/9w5si.png)

## What does it do?
The idea arised when someday I considered it useful to have a collection of web links or bookmarks – like those you have in Chrome or Firefox – accessible from everywhere without needing to synchronize your browser profile. Just like if you’re anywhere on an other PC, find a useful article on the internet and want to save it quickly for later at home. This is what Anchr’s __collections__ feature does. It saves links – with an optional description for easier search and separated into seperate categories / collections.

The second feature is to __upload images__. You can easily upload one or more photos from your computer oder mobile device and send them to friends or include them into forum posts or the like. Special with Anchr’s image hosting is that users are given the opportunity to client-sided encrypt images with a password. As a result no one without the password will ever see their photos’ content.

The last feature are __shortlinks__ – actually not any different from those you know from goo.gl or bit.ly. They’re useful if you have a very long web link including many query parameters, access tokens, session ids, special characters and the like and want to share them. Often special characters break the linking or your chat application has a maximum length for hyperlinks. Or you just want to keep clarity in your document or emails. In this case it can be very helpful to make the links as short as any possible.

Anchr’s focus is on ease and quickness of use – short loading times, flat menu hierarchies, etc. There's also a Chrome extension out there, which you can use to save or shorten links directly from the website.

## How to host it myself?
### Prerequisites
In order to host Anchr on your own, you need a few things.
* Node.js (preferbly at the latest version)
* A MongoDB database (you can use [mlab.com](http://mlab.com) to get a free, hosted MongoDB)
* Optionally, but recommended: A webserver as a reverse proxy (e.g. nginx) to enable compression and SSL encryption

### Setup and configuration
1. `$ git clone https://github.com/n1try/anchr`
2. Edit `config/config.js`. You are given three different config objects to configure different envionments (set through `NODE_ENV` environment variable). The root confog applies by default and specific fields can get overwritten, if environment specific fields are set.
    1. `db`: Set this to your MongoDB connection URL inclusing host, port, user, password and database path. If using mlab, you can just copy it from their dashboard.
    2. `uploadDir`: Set this to a directory on your filesystem, where image uploads are saved to. Don't forget to actually create the directory and give the user, who runs Anchr, according RW permissions.
    3. `accessLogPath` and `errorLogPath`: Same as with `uploadDir`, but for server logs.
    4. `secret`: A (preferably long), random character sequence to be used for the JSON Web Token
    5. `*Url`-fields: Change them to your domain
    6. All other config fields are not that important and should be self-explaining anyway.
3. Edit `config/auth.js`. Set `facebookAuth.clientID` and `facebookAuth.clientSecret` to the OAuth credentials you got from creating a Facebook app to be used for "Login with Facebook". Same for Google.
4. `$ npm install`
5. `$ cd public && bower install`

#### For development
6. `$ grunt` (from root folder)

#### For production
6. Edit `public/app/scripts/app.js` and set `$rootScope.env` variable (very bottom) from _dev_ to _production_ (yes, I know, this is not good practice at all...)
7. `$ grunt build` (from public folder)
8. `$ grunt production` (from root folder)

### TODO
* Use ORM to abstract from DBS

## License
GNU General Public License v3 (GPL-3) @ [Ferdinand Mütsch](https://ferdinand-muetsch.de)
