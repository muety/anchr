const checkers = [
    ['UBlock Badware', new (require('./ublock_badware'))()],
    ['Phishing Army', new (require('./phishingarmy'))()],
    ['OpenPhish', new (require('./openphish'))()],
    //['Safe Browsing', new (require('./safe_browsing'))({}, '<api key here>', 'anchr.io')],
]

const urls = [
    'https://kit.edu',
    'https://getmackeepersoftpro.xyz',
]

Promise.all(checkers.map(c => c[1].initialize()))
    .then(() => {
        return Promise.all(checkers.map(c => c[1].checkBulk(urls)))
    })
    .then(results => {
        for (let i = 0; i < results.length; i++) {
            for (let j = 0; j < results[i].length; j++) {
                console.log(`${checkers[i][0]} says ${urls[j]} is ${results[i][j] ? 'NOT safe' : 'safe'}.`)
            }
            console.log('')
        }
    })