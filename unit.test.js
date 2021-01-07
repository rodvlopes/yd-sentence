const fs = require('fs')
const assert = require('assert').strict
const { colorize, highlight, parseInput, progressHOF } = require('./sentence.js')

function it(msg, fn) {
    Promise.resolve(fn()).then(objs => {
        objs = [objs].flat()
        // console.log(objs)
        objs.every(({ actual, expected }) => {
            // console.log(actual, expected)
            assert.deepEqual(actual, expected, msg)
            return true
        }) && console.log(`√ ${msg}`)
    })
}

it('Should colorize word in red', () => ({
    actual: colorize('red', 'HELO'),
    expected: '\033[0;31mHELO\033[0m'
}))

it('Should highlight word in text', () => ({
    actual: highlight('alo HELO vc helo', 'HELO'),
    expected: 'alo \033[0;33mHELO\033[0m vc \033[0;33mHELO\033[0m'
}))

it('Should highlight word in text (dashed)', () => ({
    actual: highlight('alo HELO vc helo', 'HELO-VC'),
    expected: 'alo \033[0;33mHELO VC\033[0m helo'
}))

it('Should parseInput', () => {
    const data = fs.readFileSync('./example-tempered.html', { encoding: 'utf-8' })
    const { slug, sentences } = parseInput(data)
    return [{
        actual: slug,
        expected: 'tempered'
    }, {
        actual: sentences[0],
        expected: {
            id: 2328414,
            sentence: 'She was even- tempered and calm and quite as cheerful as of old.',
            upvotes: 45,
            downvotes: 20
        },
    }]
})

it('Should print a progress spin while waiting for the result', async () => {
    const slowFn = () => new Promise((res, rej) => setTimeout(() => res(1), 2000))
    const slowFnWithProgress = progressHOF(slowFn)
    const log = []
    const result = await slowFnWithProgress()
    return [{
        actual: result,
        expected: 1
    }]
})