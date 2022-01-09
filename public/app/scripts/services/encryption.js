function appendBuffer(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
};

function getKeyMaterial(password) {
    let enc = new TextEncoder();
    return window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
}

function getKey(keyMaterial, salt) {
    return window.crypto.subtle.deriveKey(
        {
            'name': 'PBKDF2',
            salt: salt,
            'iterations': 100000,
            'hash': 'SHA-256'
        },
        keyMaterial,
        { 'name': 'AES-GCM', 'length': 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

function encrypt(data, key, iv) {
    return window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        data
    )
}

function decrypt(data, key, iv) {
    return window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        data
    )
}

angular.module('anchrClientApp')
    .factory('Encryption', function () {
        return {
            /**
             * Encrypts an image with a password
             * @param {ArrayBuffer} data The image to be encrypted
             * @param {string} password The password to use for encryption
             * @returns {ArrayBuffer} The encrypted binary image data, prefixed with 16 bytes of salt, followed by 12 bytes of initialization vector
             */
            encrypt: function (data, password) {
                var salt = window.crypto.getRandomValues(new Uint8Array(16));
                var iv = window.crypto.getRandomValues(new Uint8Array(12));

                return getKeyMaterial(password)
                    .then(function (keyMaterial) {
                        return getKey(keyMaterial, salt);
                    })
                    .then(function (key) {
                        return encrypt(data, key, iv);
                    })
                    .then(function (result) {
                        var prefix = appendBuffer(salt, iv);
                        return appendBuffer(prefix, result);
                    });
            },
            /**
             * Decrypts an image using a password
             * @param {ArrayBuffer} data The encrypted binary image data, prefixed with 16 bytes of salt, followed by 12 bytes of initialization vector
             * @param {string} password The password previously used for encryption
             * @returns {ArrayBuffer} The decrypted image content
             */

            decrypt: function (data, password) {
                var salt = data.slice(0, 16);
                var iv = data.slice(16, 12 + 16);
                var image = data.slice(12 + 16);

                return getKeyMaterial(password)
                    .then(function (keyMaterial) {
                        return getKey(keyMaterial, salt);
                    })
                    .then(function (key) {
                        return decrypt(image, key, iv);
                    });
            }
        }
    });
