#!/bin/env node

const LinkCheckerService = require('../app/services/linkcheck')
const process = require('process')

const args = process.argv.slice(2)

if (args.length === 0) {
    console.error('Usage: node check_link.js <URL>')
    process.exit(1)
}

const checker = new LinkCheckerService()
checker
    .initialize()
    .then(() => checker.check(args))
    .then((results) => {
        if (!results[0]) return console.log('URL is safe ✓')
        console.log('URL is malicious! ⚠️')
        process.exit(1)
    })
    .catch(console.error)
