# anchr-webext

A Firefox plugin for Anchr realized as a [WebExtension](https://developer.mozilla.org/de/docs/Mozilla/Add-ons/WebExtensions).

## Usage
* `yarn`
* Develop: `yarn run dev`
* Build: `yarn run build`

## Note
The extension requires a [permission](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions) for accessing Anchr's API. This permission is set as a hard-coded URL pattern in `manifest.json` and therefore can't be configured dynamically for your own server instance. As a consequence, you will have to build the extension yourself to use it with your own Anchr instance (the official instance at [anchr.io](https://anchr.io) is currently shut down). To do so, change the URL pattern in `manifest.json`'s `permissions` section to `"https://anchr.yourserver.tld/*"`.

## License
GPL-3.0