import { Log, DIR_ASSETS, DIR_VIEWS, WEB_ADDR, WEB_PORT, VERSION } from './Constants';
import express from 'express';

/**
 * Handles rendering of a webpage with the given name
 * @param filename - Filename without trailing .pug extension
 * @returns {function} - Rendering Function
 */
function HandlePage(filename: string) {
    return function _HandlePageFunction(req: express.Request, res: express.Response) {
        res.render(`${filename}.pug`, {
            FILENAME: filename,
            PRODUCTION: false,
            VERSION,
        })
    }
}

express()
    .disable('x-powered-by')
    .set('view engine', 'pug')
    .set('views', DIR_VIEWS)
    .use('/assets', express.static(DIR_ASSETS))
    .use('/assets', (_, res) => res.status(404).end())

    .get('/', HandlePage('Homepage'))
    .get('/products', HandlePage('Products'))
    .get('/contact', HandlePage('Contact'))
    .post('/contact', (req, res) => {
        Log('example', 'Received Contact Request!')
        res.status(204).end()
    })

    .get('*', (_, r) => r.redirect('/'))
    .use('*', (_, r) => r.status(404).end())
    .listen(parseInt(WEB_PORT), WEB_ADDR, () => {
        Log('http', `Listening on ${WEB_ADDR}:${WEB_PORT}`)
        Log('http', `Serving Assets from: ${DIR_ASSETS}`)
        Log('http', `Serving Views from ${DIR_VIEWS}`)
    })