Source on Github: Using Thrift with TypeScript

## Introduction

At Credit Karma we are in the process of splitting a monolithic application into microservices. This presents us with problems that many companies have faced, are facing or will face as microservice architectures become the standard for most companies. To face these problems we must understand that a microservice architecture is not a silver-bullet solution to the problems we were having with our mono app.

### The Parable of Boulder Meets Hill

So, you find yourself rolling a boulder up a hill. You show up the first day. The boulder is twenty pounds. The hill isn't steep. You don't find this to be a problem, easy. The next day you show up and the boulder is twenty-five pounds, still doable. Eventually you show up one day, the boulder is 128 tons. The good news is you have a few hundred people to help you, but everyone is pushing in different directions based on their own personal agenda. Perhaps, randomly, things align and the group is able to push the boulder up the hill. Maybe things don't align, someone slips, and the boulder rolls back to the bottom, crushing the hopes and dreams of a dozen product managers.

The decision is made. We shatter the boulder and now we have pebbles that any one person can just pick up and move easily. As your organization and your application grow this makes perfect sense. Everyone gets a pebble to move. Some people want to move quickly and with purpose. That's fine. Other people want to walk up the hill, back down, side-to-side, go check out that other hill, take a nap. That's fine too. Everything is perfect. I can move at my own speed. I don't have to worry about that team that only tests their code as "true == true". However, when we get our pebble to the top of the hill we need to reassemble the boulder. Who here is the jigsaw master? Our pebble doesn't function without all the pieces it depends on and it's meaningless without all the pieces that depend on it.

### Shifting Complexity

When we decided to shatter our mono application we didn't remove complexity, we rearranged complexity. We made it easies for us to get our pebble to the top of the hill. Even at its most ideal breaking your application into microservices isn't removing complexity. It's shifting complexity. It shifts complexity from application developers to platform, frameworks and operations. This sounds like a very good thing. Separation of concerns. We're software engineers. We all love that. Application developers can just worry about their application. Those other teams can worry about getting the thing to work as it should in staging and production. Let the service teams build.

This sounds great. It certainly sounds more as it should be. The problem though is that things rarely work in the ideal state. Invariably some of the complexity in having a multitude of independent services is going to leak into the application development cycle. Specifically, we are going to look at the complexities of service-to-service communication. How do services depend on each other's data and how do we guarantee the structure of that data?

### Maintaining Type-Safety in Our Node.js Services

When we talk about guaranteeing the shape of data we are talking on some level about type-safety. A lot of JavaScript engineers may be used to dynamism. The idea of rigid types may make them uneasy. However, guarantees about types create more resilient, less error prone applications. I can guarantee you that this API will always return data in this shape and you will never have to do runtime verification as to the shape of that data. Doesn't this sound nice? The problem isn’t just type-safety. It’s compile-time guarantees about how services behave together.

I'm going to be spending most of my time covering the Thrift/RPC part of our solution and integrating that with Node. However, I do find it important to at least mention the other side of type-safe service solution, the adoption of type-safe JavaScript through TypeScript. We find both sides of this important in developing robust and resilient microservices in Node. These two things working together give us type-safety both within an application source and across service boundaries. It brings us back to the point where we can get compile-time guarantees about the shape of data passed between services, from end-to-end, while processing a single client request. The same guarantees we were able to get about the shape of data in a mono application.

### TypeScript: Type-Safe Service Code

A fundamental part of JavaScript is its dynamism. This is a very attractive part of the language to many people. As I have pushed teams to adopt TypeScript I have on various occasions been asked, "Why TypeScript?". A lot of JavaScript developers are reluctant to adopt a type-system. This is much less of an issue than it used to be, but it still comes up. I would say that in my experience most of the people who have been reluctant to adopt TypeScript have come around to finding its value. The main complaint is about dealing with compiler errors. Compiler errors are not a bad thing. The compiler is catching, very early in your development process, places where you code doesn't make sense. The alternative to this is runtime errors.

Without a type-system laid on top of JavaScript the only thing you immediately get without testing your code are syntax errors. This allows you to change the call signature of a function without updating all the places its called. It allows you to remove a property from an object without updating all the places you use that object. Do you want to manually go through and find all those places? It can be very important to get to 100% test code-coverage for JavaScript apps because of this, not because you are testing the logic of your application, just to check if the thing is wired together properly and changes to call-signature, object shape, value type will be caught before production runtime errors. Tests should be concerned with your application logic, not as some pseudo type-checker. If you are using strict compiler flags, TypeScript can even enforce that you safely handle values that are potentially null/undefined.

In the end, TypeScript allows service teams to write code that is largely familiar to any JavaScript developer, including the Node/JS ecosystem, while also providing more guarantees about the correctness of code earlier in the development process. The earlier errors are caught the quicker and easier they are to fix. Particularly, compiler errors tend to be very specific about exactly where and why an error occurred. JavaScript runtime errors, on the other hand, can be very painful to track down, particularly in large codebases. Okay, yeah, an error occurred. Now you have to reproduce it locally and hope the stack trace leads you to the problem. Let's avoid that as much as possible and catch more errors earlier in the development cycle.

### Type-Safe Service Communication

Type-safe application source brings us to the other side of the coin, type-safe service communication. When we break up a mono app we have to decide how we are going to communicate between different services. How do you get the data you need from another service? What is the shape of that data? How do you provide data to services that rely on you? How do you do these things in a way that is both robust and resilient?

These questions are much less complex in a mono application, where all service requests essentially amount to a local function call. A compiler can guarantee that you are using another service's API correctly and that other services are using your API correctly. You can focus on building out your business logic.

```typescript
import {
  getUser,
  User,
} from '../UserService'

const userId: number = 2382747
const user: User = getUser(userId)
sendName(user.name)
```

If a service you depend on suddenly changes the data they are returning, or the arguments they take, and you don't update the build will fail. There is no chance to break production with runtime errors because the shape of the data changes. Maybe I exaggerate when I say no chance, but you get my point. A compiler can provide strong guarantees about the data passed between services.

When moving to microservices, this sharing of data between services becomes more complicated and more fragile. This can be solved in a number of different ways. You can provide a REST API. You can use a RPC (remote procedure call) framework. I've seen some people advocating for GraphQL for service-to-service communication. All of these can be valid solutions and a company may choose to support multiple solutions. The particular method isn't as important as building guarantees on top of the chosen solution.

Services need to decide what data they are going to provide, what data they need from consumers in order to provide that response, how to verify the data they receive and how to communicate the API. These are certainly not impossible problems and are conceptually not difficult to understand. It's just that these are problems that don't exist in a mono app that are introduced by our switch to microservices. Especially in the realm of JavaScript developers most of us have written applications where we send and receive blobs of JSON without doing all we can to validate the data nor doing all we could to communicate our API.

```typescript
request({ url: 'http://blackhole:9000' }, (err, response, body) => {
  // What is the body?
  if (body && body.something) { … }
})
```

### Service Contracts and Code Generation

The solution starts with a service contract. A service contract is a description of a service API. It answers the questions of what a service is going to provide and what that service needs from consumers in order to provide that data or those actions. We're not talking in hand-wavy kinda-sorta speak here. Specifically and without question what do you need from me and what am I going to get? For the sake of discussion let's say this is some agreed upon schema file that lives somewhere that is easily accessible to both teams. Okay, now what? Do we just rely on people to follow this schema? No, in order for this to really be a contract we need some form of enforcement. We do not rely on people to do what they are supposed to do. Things are invariably going to fall over when they shouldn't.

How do we get enforcement of our service contract? The enforcement we want is from the compiler. We want to be able to get the same type-safety from remote services as we get from our local source code. In order to do this we are going to rely on code generation. We need code generation from the schema. We need to generate, at least, the interfaces for the client and server. Once the interfaces are generated we can get some compile-time type-safety that people are passing data in a manner consistent with the agreed upon service contract. If the service contract changes the generated code will automatically update and we will start getting compile-time build failures with hopefully specific messages about what needs to be changed.

Without code generation the service contract is nothing more than an API document that team members can choose to ignore, mistakenly implement, or just miss updates to. This two-headed beast of service contract with code generation can get us back to the point where all of your code has compile time guarantees, your local source and your remote service dependencies.

### Implementing Solutions with Thrift and TypeScript

While we have discussed microservice communication problems and solutions in relatively broad terms to this point, it's time to start building some working code. How, specifically, are we solving these problems at Credit Karma, with a specific eye on our Node services? As mentioned we use TypeScript to give more guarantees to our Node application source. We then use Thrift to provide type-safe service-to-service communication. We then build libraries with TypeScript to make interfacing with Thrift as easy and transparent as possible to service teams.

### What is Thrift?

Thrift is an interface definition language (IDL) and remote procedure call (RPC) framework originally developed at Facebook. It is now hosted by Apache. There are many other similar frameworks we could have chosen, both for REST and RPC. The choice of Thrift is not that important to service teams. Some people will advocate for and against it. Thrift is a tool and gives us what we need, a way to define service contracts, the IDL, and code generation for multiple runtimes.

The Thrift IDL looks very much like C code.

```c
struct User {
  1: required i32 id
  2: required string name
}

exception UserServiceException {
  1: required string message
}

service UserService {
  User getUser(1: i32 id) throws (1: UserServiceException exp)
}
```

This defines a service with one exposed method "getUser". This method takes one argument a 32-bit integer which acts as the user identification. This method returns a User object, defined here as a struct. If something goes wrong this method will return a UserServiceException. We are going to use this contract to build a working Thrift server, client and API gateway. Don't worry. This won't take much code.

The Apache Thrift project includes a code generator, and supporting libraries, for many runtimes. This means from one service contract service teams are able to choose from multiple languages (Java, Python, JS, Haskell, PHP, Go...). This also means the service in question and services that consume that service can use different runtimes. At Credit Karma, for instance, we use Node, Scala and PHP.

## Building Thrift Support for Node

As we started supporting Thrift for Node it became apparent that there were going to be a number of short-comings with the existing Apache Thrift libraries for Node. The code generator is written in C++ and produces generated TypeScript that is lacking. The generated TypeScript can't be compiled with strict compiler flags, uses the "any" type liberally, undermining the benefits of TypeScript, and doesn't provide access to the underlying request and response objects, making authentication and tracing more difficult. In addition, the generated code doesn't leverage common OSS libraries and the supplied Node libraries are not well-maintained.

The above issues made the existing Thrift project unacceptable for our Node projects. We decided to build our own Node Thrift implementation on top of TypeScript. This would allow us to both leverage tools already familiar to Node developers and to build our own tools with Node developers in mind. It would also allow us to generate TypeScript from Thrift that could be strictly compiled and easy to use. By building all of our tools in TypeScript we also open up the possibility for anyone in the Node community to contribute back to the projects. If, for instance, you find a bug in the code generator you probably have the skills to fix it as the codebase is TypeScript. The JavaScript community is largely used to using tools that are written in JavaScript. This opens things up considerably.

When building our libraries we wanted to be careful and restrained about the opinions we enforced. We wanted the libraries to be malleable to a variety of situation and needs. In doing so, instead of building a unified Thrift/TypeScript framework we built a collection of modular libraries. The libraries we built are: thrift-parser, thrift-typescript, thrift-client, and thrift-server. All of these are found on NPM under the "@creditkarma" scope.

```sh
$ npm install --save-dev @creditkarma/thrift-parser
$ npm install --save-dev @creditkarma/thrift-typescript
$ npm install --save @creditkarma/thrift-server-core
$ npm install --save @creditkarma/thrift-client
$ npm install --save @creditkarma/thrift-server-hapi
$ npm install --save @creditkarma/thrift-server-express
```

As we take a look at these libraries we are going to use them to build a working service. You can follow along or view the working source.

```sh
$ git clone https://github.com/kevinbgreene/thrift-tutorial.git
```

### Thrift Parser

[@creditkarma/thrift-parser]()

Thrift Parser is a library that parses Thrift IDL into a robust AST. The API is simple, centering around a single "parse" function. The parse function takes a string of Thrift source and returns an object representing the AST.

```typescript
import { parse, ThriftDocument } from '@creditkarma/thrift-parser'

const rawThrift: string = `
  struct User {
    1: required i32 id
    2: required string name
  }

  exception UserServiceException {
    1: required string message
  }

  service UserService {
    User getUser(1: i32 id) throws (1: UserServiceException exp)
  }
`

const thriftAST: ThriftDocument = parse(rawThrift)
```

The generated AST owes a lot to the JavaScript AST generated by Babylon. The idea being that the AST has all the information one might need and translate easily into JavaScript. It resides as a stand-alone project for the development of other generators or linters.

### Thrift TypeScript

[@creditkarma/thrift-typescript]()

Thrift TypeScript is a code generator built on top of Thrift Parser. It produces TypeScript code that can be compiled with all of the strict compiler options set to "true". It can be used to generate code for the supporting Apache Thrift Node libraries. Of course we use it to generate code supported by our own libraries.

The most common usage would be as a command line utility that could be added to your npm scripts.

$ thrift-typescript --target thrift-server --sourceDir thrift --outDir src/codegen
The "target" option is what says we are generating code for our Thrift Server/Client libraries (by default it will build for Apache). After providing compiler options you can list Thrift files, space-separated, to generate from. If you don't pass a file list it will generate code from all "*.thrift" files in the source directory.

Running the above command will look for Thrift files in the "thrift" directory and save the generated TypeScript files to "src/codegen", both relative to the current working directory.

Usually, you would want to add the above command to your NPM scripts.

```json
{
  "scripts": {
    "clean": "rm -rf dist && rm -rf src/codegen",
    "codegen": "thrift-typescript --target thrift-server --sourceDir thrift --outDir src/codegen",
    "prebuild": "npm run clean",
    "build": "tsc"
  }
}
```

Now we can Thrift code generation is transparent behind our usual "npm run build" command.

Thrift Client
Thrift Client is a library, built on top of the popular Request library, for creating Thrift service clients. The service client will be a class that has all of the methods defined in our IDL file. Because this is generated TypeScript we have compile-time type-safety that we are using the remote service exactly as it is meant to be used. Additionally, the validation of the returned payload is handled by the generated code, and associated libraries, guaranteeing that by the time return values get to your code they are of the type expected.

On the other end, the remote service should be building its server from the exact same IDL file, providing service guarantees from both ends.

```typescript
import {
  createClient,
} from '@creditkarma/thrift-client'

import {
  UserService,
  User,
} from './codegen/UserService'


const serviceClient: UserService.Client =
  createClient(UserService.Client, {
    hostName: 'localhost',
    port: 8080
  })

serviceClient.getUser(1).then((user: User) => {
  // We got a user!console.log(user.name)
})
```

To create a service client instance you need the generated class (UserService.Client) and the connection details for the remote service (hostname and port). From there you can use the client instance exactly as is defined in the Thrift IDL file, as you would any other function defined in your application code.

### Thrift Server

[@creditkarma/thrift-server]()

Thrift Server then is the other side of Thrift Client. It is the library for working with the generated service processor code. Actually Thrift Server is a collection of libraries. One of the things we wanted to do was to work with existing Node HTTP server libraries. We currently provide Thrift support to Hapi through a plugin and to Express though middleware. That means it is easy to add Thrift support to an existing service, or for a service to support both Thrift and REST, or to even also act as a static file server.

```typescript
import * as express from 'express'
import * as bodyParser from 'body-parser'
import { thriftExpress } from '@creditkarma/thrift-server-express'

import { User, UserService } from './codegen/UserService'

const app: express.Application = express()

const serverConfig = {
  hostName: 'localhost',
  port: 8080,
}

const serviceHandlers: UserService.IHandler<express.Request> = {
  getUser(userId: number, context?: express.Request): User | Promise<User> {
    return new User({ id: userId, name: 'John Doe' })
  }
}

app.use(
  '/thrift', // Path to server thrift on
  bodyParser.raw(), // Thrift parses the body
  thriftExpress(TestService.Processor, serviceHandlers)
)

app.listen(serverConfig.port, () => {
  console.log(`Thrift server listening at http://${serverConfig.hostName}:${serverConfig.port}`)
})
```

The above code is all that is needed to add the Thrift service endpoint for the Thrift client to get data. The generated code provides an interface, "IHandler", that defines the methods you need to provide to satisfy the service contract. The handlers you provide are used to create the Processor class which is the object that handles encoding JavaScript objects to Thrift binary that can be sent over the wire. Again, because the generated code is TypeScript, the service team gets compile-type guarantees that they are properly implementing their service contract (at least on a type level).

### API Gateway

To complete our example Thrift project we are going to update our Thrift client code to expose itself as a REST-ish API.

```typescript
import {
  createClient,
} from '@creditkarma/thrift-client'

import * as express from 'express'

import {
  UserService,
  User,
} from './codegen/UserService'

const app: express.Application = express()

const serverConfig = {
  hostName: 'localhost',
  port: 8080,
}

const clientConfig = {
  hostName: 'localhost',
  port: 9000,
}

// SET UP CLIENT

const userClient: UserService.Client =
  createClient(UserService.Client, clientConfig)

// START API SERVER

app.get('/healthcheck', (req, res) => {
  res.send('success')
})

app.get('/user/:id', (req, res) => {
  console.log(`Gateway: fetching User with id: ${req.params.id}`)
  userClient.getPost(req.params.id).then((user: User) => {
    res.send(user)
  }, (err: any) => {
    res.send(err).status(500)
  })
})

app.listen(serverConfig.port, () => {
  console.log(`Web server listening at http://${serverConfig.hostName}:${serverConfig.port}`)
})
```

### The Thrift Stack

Using the Thrift stack allows us to get compile-time guarantees about our service contracts. The Thrift IDL is the source of truth for both service providers and service consumers. Combining this Thrift source with code generation is what provides guarantees. The same Thrift IDL source could be used by multiple runtimes to provide compile-time guarantees both across services and across runtimes.

Assuming a collection of Node services, the Thrift stack looks like this:

### HTTP, TCP and Protocol Decisions

One thing you may have noticed about all of this is that we are omitting TCP support. When we made the decision to expose our libraries as plugins to popular HTTP server libraries we made a tradeoff to forgo TCP support. This makes providing a Thrift service a little easier to the average Node developer. It also allows us to use HTTP headers to do authentication, tracing and to pass other request metadata. This tradeoff was also made with the mindset that we would support HTTP2 in the near future, mitigating the advantages of TCP support.

## Conclusion