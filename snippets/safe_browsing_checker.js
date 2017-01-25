'use strict';

const request = require('request'),
    url = require('url'),
    MongoClient = require('mongodb').MongoClient,
    fs = require('fs'),
    path = require('path'),
    winston = require('winston'),
    DB_URL = 'mongodb://anchr:Agiwovibu146@ferdinand-muetsch.de:27017/anchr',
    COLLECTION = 'shortlinks',
    THRESHOLD = 1;

winston.add(winston.transports.File, { filename: 'safe_browsing_checker.log' });

let processedIds = [];

try {
    processedIds = JSON.parse(fs.readFileSync(path.normalize(__dirname + '/history.json')));
} catch (e) {}

MongoClient.connect(DB_URL, function(err, db) {
    let coll = db.collection(COLLECTION);

    coll.find({ _id: { $nin: processedIds } }).toArray((err, results) => {
        if (!results.length) notifyFinished(-1, db);
        results.forEach((result) => {
            let host = url.parse(result.url).hostname;
            winston.log('debug', 'Processing ' + host);
            request('https://safeweb.norton.com/report/show?url=' + host, (err, res, body) => {
                processedIds.push(result._id);
                if (body && extractNumber(body) >= THRESHOLD) {
                    coll.deleteOne({ _id: result._id }, (err, ok) => {
                        if (err) winston.log('info', '[FAILED] ' + result.url);
                        else winston.log('info', '[DELETED] ' + result.url);
                        notifyFinished(results.length, db);
                    });
                } else notifyFinished(results.length, db);
            });
        });
    });
});

function extractNumber(textString) {
    const searchString = '<b> Total threats</b> on this site: ';
    let sub = textString.substr(textString.indexOf(searchString));
    sub = sub.substr(searchString.length);
    let num = parseInt(sub.substr(0, sub.indexOf(' ')));
    return num || -1;
}

let c = 0;

function notifyFinished(total, db) {
    c++;
    if (c === total || total === -1) {
        winston.log('info', `Processed ${total === -1 ? 0 : c} entries.`);
        fs.writeFileSync(path.normalize(__dirname + '/history.json'), JSON.stringify(processedIds));
        db.close();
    }
}