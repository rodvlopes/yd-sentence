#!/usr/bin/env node

const { readFileSync } = require('fs')

/**
 * Expects https://sentence.yourdictionary.com/ html content
 */
function readSentencesFromStdin() {
    var data = readFileSync(0, 'utf-8');
    var dataSplit = data.split('JSON.parse(')
    var lastSegment = dataSplit[dataSplit.length - 1]
    var targetJson = lastSegment.split(');<')[0]
    var target = JSON.parse(JSON.parse(targetJson)).data.data
    return target
}

function colorize(color, word) {
    const NC = '\033[0m' //# No Color
    const table = {
        'red': '\033[0;31m',
        'blue': '\033[0;32m',
        'yellow': '\033[0;33m',
        'grey': '\033[0;34m',
        'nc': '\033[0m',
    }
    return `${table[color]}${word}${NC}`
}

/**
 * Print to Bash with a highlighted word.
 * @param txt   a text to print
 * @param word  a word to highlight
 */
function hilghlight(txt, word) {
    const coloredWord = colorize('red', word) 
    return txt.replace(new RegExp(`\\b${word}\\b`, 'ig'), coloredWord)
}

//                    _       
//    _ __ ___   __ _(_)_ __  
//   | '_ ` _ \ / _` | | '_ \ 
//   | | | | | | (_| | | | | |
//   |_| |_| |_|\__,_|_|_| |_|

var { slug, sentences } = readSentencesFromStdin()
sentences.splice(10)

console.log('Sentences for', slug)
sentences.forEach(({ sentence, upvotes, downvotes }, i) => {
    const highlightedSentence = hilghlight(sentence, slug)
    const grey_i = colorize('nc', `${i}.`)
    const blue_upv = colorize('blue', `↑${upvotes}`)
    const red_dwv = colorize('red', `↓${downvotes}`)
    console.log(`${grey_i} (${blue_upv} ${red_dwv}) ${highlightedSentence}`)
})