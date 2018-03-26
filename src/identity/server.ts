import * as Hapi from 'hapi'

import {
    config,
} from '@creditkarma/dynamic-config'

import {
  ThriftServerHapi,
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
     * Register the thrift plugin.
     *
     * This will add a Thrift route handler to the '/thrift' path.
     * This behaves like any other HTTP route handler, so you can mix and match
     * thrift / REST endpoints on the same server instance.
     */
    server.register(ThriftServerHapi({
        path: '/thrift',
        thriftOptions: {
            serviceName: '',
            handler: serviceProcessor,
        },
    }), (err: any) => {
        if (err) {
            throw err
        }
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
