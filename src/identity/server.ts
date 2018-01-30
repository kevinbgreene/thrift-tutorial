import * as Hapi from 'hapi'

import {
    config,
} from '@creditkarma/dynamic-config'

import {
  ThriftPlugin,
} from '@creditkarma/thrift-server-hapi'

import {
    User,
    UserService,
    UserServiceException,
} from '../codegen/com/identity/UserService'

import {
    findUser,
    IMockUser,
} from './data'

(async function createIdentityServer() {
    const server = new Hapi.Server({ debug: { request: ['error'] } })
    const serverConfig = await config().get('identity.server')

    server.connection({ port: serverConfig.port })

    /**
     * Register the thrift plugin.
     *
     * This will allow us to define Hapi routes for our thrift service(s).
     * They behave like any other HTTP route handler, so you can mix and match
     * thrift / REST endpoints on the same server instance.
     */
    server.register(ThriftPlugin, (err: any) => {
        if (err) {
            throw err
        }
    })

    /**
     * Create our service processor
     */
    const serviceProcessor: UserService.Processor<Hapi.Request> =
        new UserService.Processor({
            getUser(id: number, context?: Hapi.Request): User {
                console.log(`UserService_v1: getUser[${id}]`)
                const user: IMockUser | undefined = findUser(id)
                if (user !== undefined) {
                    return new User({
                        id: user.id,
                        name: `${user.firstName} ${user.lastName}`,
                    })
                } else {
                    throw new UserServiceException({
                        message: `Unable to find user for id[${id}]`,
                    })
                }
            },
        })

    /**
     * Route to our thrift service.
     *
     * Payload parsing is disabled - the thrift plugin parses the raw request
     * using whichever protocol is configured (binary, compact, json...)
     */
    server.route({
        method: 'POST',
        path: serverConfig.path,
        handler: {
            thrift: {
                service: serviceProcessor,
            },
        },
        config: {
            payload: {
                parse: false,
            },
        },
    })

    /**
     * Finally, we're ready to start the server.
     */
    server.start((err: any) => {
        if (err) {
            throw err
        }
        console.log('info', `Server running on port ${serverConfig.port}`)
    })
}())
