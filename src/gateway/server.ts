import {
    config,
} from '@creditkarma/dynamic-config'

import {
  createHttpClient,
} from '@creditkarma/thrift-client'

import * as express from 'express'

import {
  ContentService,
  Post,
} from '../codegen/com/content/ContentService'

(async function createAPIServer() {
    const app: express.Application = express()
    const serverConfig = await config().get('gateway.server')
    const clientConfig = await config().get('gateway.client')

    // SET UP CLIENT

    const contentClient: ContentService.Client = createHttpClient(ContentService.Client, clientConfig)

    // START API SERVER

    app.get('/healthcheck', (req, res) => {
        res.send('success')
    })

    app.get('/post/:id', (req, res) => {
        console.log(`Gateway: fetching post with id: ${req.params.id}`)
        contentClient.getPost(req.params.id).then((post: Post) => {
            res.send(post)
        }, (err: any) => {
            res.send(err).status(500)
        })
    })

    app.listen(serverConfig.port, () => {
        console.log(`Web server listening at http://${serverConfig.hostName}:${serverConfig.port}`)
    })
}())
