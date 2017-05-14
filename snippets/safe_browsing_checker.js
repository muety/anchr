'use strict';

/*
https://developers.google.com/safe-browsing/v3/lookup-guide
https://console.developers.google.com/apis/credentials?project=anchr-156715
https://github.com/n1try/node-safe-browse
*/

const url = require('url'),
    MongoClient = require('mongodb').MongoClient,
    fs = require('fs'),
    path = require('path'),
    winston = require('winston'),
    SafeBrowse = require('safe-browse'),
    api = SafeBrowse.Api('AIzaSyCjjrpLaBBvF202Gr2xzqgmX4nJAHtFML8'),
    DB_URL = 'mongodb://anchr:Agiwovibu146@ferdinand-muetsch.de:27017/anchr',
    COLLECTION = 'shortlinks';

Array.prototype.getUnique = function() {
    var u = {},
        a = [];
    for (var i = 0, l = this.length; i < l; ++i) {
        if (u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
}

winston.add(winston.transports.File, { filename: path.normalize(__dirname + '/safe_browsing_checker.log') });

let processedIds = [];
let dbConnection = null;
let total = 0;
let numProcessed = 0;

/*
try {
    processedIds = JSON.parse(fs.readFileSync(path.normalize(__dirname + '/history.json')));
} catch (e) {}
*/

MongoClient.connect(DB_URL, function(err, db) {
    let coll = db.collection(COLLECTION);
    dbConnection = db;

    coll.find({ _id: { $nin: processedIds } }).toArray((err, results) => {
        if (!results.length) exit(null);
        let resultMap = results.reduce(function(map, obj) {
            if (map[obj.url]) map[obj.url].push(obj._id);
            else map[obj.url] = [obj._id];
            return map;
        }, {});

        api.lookup(Object.keys(resultMap).getUnique(), (err, data) => {
            if (err) return exit(err);
            data = data.data;
            total = Object.keys(data).length;

            for (let key in data) {
                if (data[key] !== 'ok') {
                    coll.deleteMany({ url: key }, (err, ok) => {
                        if (err) winston.log('info', '[FAILED] ' + key);
                        else {
                            winston.log('info', '[DELETED] ' + key);
                            numProcessed += resultMap[key].length;
                            processedIds = processedIds.concat(resultMap[key]);
                        }
                        notifyFinished();
                    });
                } else {
                    numProcessed += resultMap[key].length;
                    processedIds = processedIds.concat(resultMap[key]);
                    notifyFinished();
                }
            }
        });
    });
});

let c = 0;

function notifyFinished() {
    c++;
    if (c >= total) exit(null);
}

function exit(err) {
    if (!err) winston.log('info', `Processed ${numProcessed} entries.`);
    else winston.log('info', `[ERROR] ${err.message}`);
    //fs.writeFileSync(path.normalize(__dirname + '/history.json'), JSON.stringify(processedIds));
    dbConnection.close();
    process.exit(0);
}
