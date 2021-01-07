#!/usr/bin/env node

const { promisify } = require('util')
const https = require('https')

https.get[promisify.custom] = options =>
    new Promise((resolve, reject) => {
        https.get(options, (response) => {
            response.end = new Promise((resolve) => response.on('end', resolve))
            resolve(response)
        }).on('error', reject)
    })

const httpGet = promisify(https.get);

/**
 * Wraps a word with a terminal's color code.
 * @param {string} color 
 * @param {string} word 
 */
function colorize(color, word) {
    const NC = '\033[0m' //# No Color
    const table = {
        'red': '\033[0;31m',
        'blue': '\033[0;34m',
        'yellow': '\033[0;33m',
        'grey': '\033[0;100m',
        'nc': '\033[0m',
    }
    return `${table[color]}${word}${NC}`
}

/**
 * Wraps a word with a red color in a text.
 * @param {string} txt   a text to print
 * @param {string} word  a word to highlight
 */
function highlight(txt, word) {
    const coloredWord = colorize('yellow', word)
    const wordSp = word.replace('-', ' ')
    const coloredWordSp = colorize('yellow', wordSp)
    return txt.replace(new RegExp(`\\b${word}\\b`, 'ig'), coloredWord)
        .replace(new RegExp(`\\b${wordSp}\\b`, 'ig'), coloredWordSp)
}

/**
 * Expects https://sentence.yourdictionary.com/ html content
 * @param {string} data
 */
function parseInput(data) {
    var dataSplit = data.split('JSON.parse(')
    var targetSegment = dataSplit.find(it => it.includes('upvotes'))
    var targetJson = targetSegment.split(');<')[0]
    var target = JSON.parse(JSON.parse(targetJson)).data.data
    return target
}

/**
 * Read https://sentence.yourdictionary.com/${word} and retuns its content.
 * @param {string} word  must be a slug
 */
async function crawlYD(word) {
    try {
        const response = await httpGet(`https://sentence.yourdictionary.com/${word}`)
        let body = ''
        response.on('data', chunk => body += chunk)
        await response.end
        return body
    }
    catch (e) {
        console.error(e)
    }
}


function printHelp() {
    console.log(`Usage: ./${process.argv[1]} word`)
}

function printColorTable() {
    const NC = '\033[0m'
    for (let i = 1; i < 128; i++) {
        process.stdout.write('\033[0;' + `${i}m |${i}| ${NC}`)
    }
    console.log('')
}

function progressHOF(fn) {
    return async function () {
        const spin = '-\\|/'
        let i = 0;
        const interval = setInterval(() => process.stdout.write(`${spin[i++%4]}\r`), 200)
        let result = await fn(...arguments)
        clearInterval(interval)
        return result
    }
}

//                    _       
//    _ __ ___   __ _(_)_ __  
//   | '_ ` _ \ / _` | | '_ \ 
//   | | | | | | (_| | | | | |
//   |_| |_| |_|\__,_|_|_| |_|

async function main(argv) {
    const word = (argv.splice(2)).join('-')

    if (!word) {
        printHelp()
        return
    }

    var data = await progressHOF(crawlYD)(word)

    if (!data) {
        console.log('no data found')
        return
    }

    var { slug, sentences } = parseInput(data)
    sentences.splice(10)

    console.log('Sentences for', slug)
    sentences.forEach(({ sentence, upvotes, downvotes }, i) => {
        const highlightedSentence = highlight(sentence, slug)
        const grey_i = colorize('nc', `${i}.`)
        const blue_upv = colorize('blue', `↑${upvotes}`)
        const red_dwv = colorize('red', `↓${downvotes}`)
        console.log(`${grey_i} (${blue_upv} ${red_dwv}) ${highlightedSentence}`)
    })
}

if (require.main === module) {
    main(process.argv)
}

module.exports = {
    colorize,
    highlight,
    parseInput,
    progressHOF
}