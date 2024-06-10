import { writeFileSync, cpSync, readFileSync, readdirSync } from 'fs'
import { VERSION, Log } from './Constants'
import { renderFile } from 'pug'
import ugilfyJs from 'uglify-js'
import CleanCSS from 'clean-css'
import path from 'path'

const start = Date.now()
const minifyJs = ugilfyJs.minify
const minifyCss = (x: string) => new CleanCSS().minify(x)

// Copy Assets
cpSync('assets', 'build/assets', {
    recursive: true,
    errorOnExist: false,
    filter: function copyFilter(source: string, destination: string) {
        switch (path.extname(source)) {
            case '.js':
                // Minify Content
                const jsInput = readFileSync(source, 'utf8')
                const jsOutput = minifyJs(jsInput)
                if (jsOutput.error) throw jsOutput.error
                writeFileSync(destination, jsOutput.code)

                // Minify Results
                const sizeJsInput = Buffer.byteLength(jsInput)
                const sizeJsOutput = Buffer.byteLength(jsOutput.code)
                const compJsRatio = Math.round((sizeJsOutput / sizeJsInput) * 100)
                Log('build', `Minified ${path.basename(source).padEnd(24, ' ')} - ${sizeJsInput}b => ${sizeJsOutput}b (${compJsRatio}%)`)
                return false

            case '.css':
                const cssInput = readFileSync(source, 'utf8')
                const cssOutput = minifyCss(cssInput)
                writeFileSync(destination, cssOutput.styles)
                if (cssOutput.errors.length > 0) {
                    throw cssOutput.errors.join('\n')
                }

                // Minify Results
                const sizeCssInput = Buffer.byteLength(cssInput)
                const sizeCssOutput = Buffer.byteLength(cssOutput.styles)
                const compCssRatio = Math.round((sizeCssOutput / sizeCssInput) * 100)
                Log('build', `Minified ${path.basename(source).padEnd(24, ' ')} - ${sizeCssInput}b => ${sizeCssOutput}b (${compCssRatio}%)`)
                return false

            default:
                // Just copy it... 
                return true
        }
    },
})

// Build Documents
for (const filename of readdirSync('views')) {
    if (filename === '_Template.pug') continue

    const filenameNoExtension = path
        .basename(filename)
        .slice(0, -path.extname(filename).length)

    const filenameOutput =
        filename === 'Homepage.pug'
            ? 'index'
            : filenameNoExtension.toLowerCase()

    const renderOutput = renderFile(`views/${filename}`, {
        FILENAME: filenameNoExtension,
        PRODUCTION: true,
        VERSION,
    })

    writeFileSync(`build/${filenameOutput}.html`, renderOutput)
    Log('build', `Rendered ${filename.padEnd(24, ' ')} - ${Buffer.byteLength(renderOutput)}b`)
}

// Special Files
// writeFileSync('build/_redirects', '/ /Homepage.html 302')
writeFileSync('build/robots.txt', 'User-agent: *\nAllow: /')

// All Done!
Log('build', `Finished in ${((Date.now() - start) / 1000).toFixed(2)}s`)