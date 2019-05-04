export interface IServerConfig {
    hostName: string
    port: number
    path: string
}

export const gateway = {
    server: {
        hostName: 'localhost',
        port: 9000,
        path: '/',
    },
    client: {
        hostName: 'localhost',
        port: 8095,
        path: '/',
    },
}

export const content = {
    server: {
        hostName: 'localhost',
        port: 8095,
        path: '/',
    },
    client: {
        hostName: 'localhost',
        port: 8085,
        path: '/thrift',
    },
}

export const identity = {
    server: {
        hostName: 'localhost',
        port: 8085,
        path: '/',
    },
}
