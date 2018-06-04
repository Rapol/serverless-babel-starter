![logo](./logo.png)
[![Greenkeeper badge](https://badges.greenkeeper.io/postlight/serverless-babel-starter.svg)](https://greenkeeper.io/)

# Serverless Boilerplate

Rapol's version of Postlight's Modern Serverless Starter Kit adds a light layer on top of the Serverless framework, giving you the latest in modern JavaScript (ES6 via Webpack + Babel, mocha, and linting with ESLint), the ease and power of Serverless, and a few handy helpers (like router for your service pattern, handling warm functions and response helpers)

Once installed, you can create and deploy functions with the latest ES6 features in minutes, with linting and formatting baked in.

Note: This uses [lambda-utils](https://github.com/Rapol/lambda-utils) which is a library that gives
us the utility functions that we talk about before.

## Install

```bash
# If you don't already have the serverless cli installed, do that
npm install -g serverless 

# Install dependencies
npm install
```

## Deployment

AWS profile, NODE_ENV and, REGION must be set prior deploying or testing. Assuming you've already set up your default AWS credentials, modify the scripts/env/dev-us-east-1.sh file to use your AWS_PROFILE.

To deploy dev run:
```
soruce scripts/env/dev-us-east-1.sh
npm run deploy:dev
```

`npm deploy:env` will deploy the environment set by NODE_ENV. You can deploy to `stage` or `production`
with:

```
npm deploy:stage

# -- or --

npm deploy:production
```

After you've deployed, the output of the deploy script will give you the API endpoint
for your deployed function(s), so you should be able to test the deployed API via that URL..

Note: Currently, this starter kit specifically targets AWS.

TODO: Update the rest of the readme

## Serverless Configuration

### Stage convention

The serverless stage variable is been set dynamically in serverless.yml to:

`{stage}{api-version}` ie. `devv0101`

Doing this will create a new deployment whenever we change the the stage name or the api version

The `{stage}` variable is been set by NODE_ENV

### API Versioning

The plugin serverless-domain-manager is used to set up a custom domain and a base path. This allow
us to version the API using the base path and be able to separate the deployments of each
version.

Deploying the current configuration will create an API Gateway named `devv0100-serverless-da-boilerplate`. The stage of the API will be named `devv0100` and the default API url will be in the format: 

`https://{apiId}.execute-api.us-east-1.amazonaws.com/devv0100`

By setting up the customDomain in serverless.yml, we can set up a custom doamin and point our newly deploy API with versioning with the following format:

`api.{region}.{stage}.${your-domain}/v01_00`

### env.yml

This file is used to store variables for environment variables or any constants used in the configuration. This file is imported to serverless.yml under custom.variables.ENV

```
default_env: &default_env
 # variables that are global across env and regions
 # DB, domain variables, etc

dev-us-east-1:
  <<: *default_env
  # env and region specific variables
```

### CF References

If you have deployed any infrastructure that needs to be referenced you can do so in the custom.stackOutputs section of the serverless.yml:

`lambdaSubnet1: "${cf:${self:custom.variables.ENV.STACK_NAME}.SubnetLambdaPrivateId}"`

### Serverless Pattern

The project is setup in a [Service Pattern](https://serverless.com/blog/serverless-architecture-code-patterns/). In the Services Pattern, a single Lambda function can
handle a few (~4) jobs that are usually related. In this case, they share the same path.

For example, a user lambda will handle all routes under the /user path. We provide a router to 
abstract the logic of routing to your different functions. You can configure it however
you want but this is the pattern that we have found to work for us.

Benefits of the Service Pattern: 
- Less Lambda functions that you need to manage.
- Some separation of concerns still exists.
- Teams can still work autonomously.
- Faster deployments.
- Theoretically better performance. When multiple jobs are within a Lambda function, there is a higher likelihood that Lambda function will be called more regularly, which means the Lambda will stay warm and users will run into less cold-starts.

### Documentation

serverless-plugin-split-stacks plugin is used to document our API Gateway. This will create
models in API Gateway that can be used to describe the request and response documentation for each
endpoint. This will also allow you to generate a swagger file and a client sdk for your API directly
from the API Gateway console.

Models are defined in JSON schema and stored in the /models folder.

```
$schema: "http://json-schema.org/draft-04/schema#"
type: "object"
properties:
  status:
    type: integer
```

This models are referenced in the documentation.yml and then used in the functions section of the serverless configuration
to describe the request and response of the endpoints.

## Development

Creating and deploying a new function takes two steps, which you can see in action with this repo's default app-info function

### 1. Add a new function

Add a new function definition under /functions. Like so:

```yaml
  handler: src/hello/index.default
  events:
    - http:
        path: hello
        method: get
    # Ping every 5 minutes to avoid cold starts
    - schedule:
        rate: rate(5 minutes)
        enabled: true
```

In the serverless.yml, reference the file you created to tell serverless about our new function

```yaml
functions:
  misc: ${file(functions/misc.yml)}
  hello: ${file(functions/hello.yml)}
```

Ignoring the scheduling event, you can see here that we're setting up a function named `hello` with a handler at `src/hello/index.js` (the `.default` piece is just indicating that the function to run will be the default export from that file). The `http` event says that this function will run when an http event is triggered (on AWS, this happens via API Gateway).

### 2. Set up the route.js

Since we said that we are using the Service Pattern, we need to define a JSON file which states
what routes will our new function handle.

Create a new file src/hello/routes.js:
```
import handlers from './handlers';

export default {
    '/hello': {
        GET: {
            handler: handlers.hello,
            response: {
                headers: {},
                statusCode: 200,
            },
        },
    },
};
```

Here we are defining that our function will call the handlers.hello function when a GET method is called
for the /hello endpoint.

### 3. Define your handler

Create a file /src/hello/handlers.js that exposes a function of your handler.

```js
import { log, utils } from 'lambda-utils';

const TAG = 'hello::handlers';

async function hello(_event, context, routeInfo) {
    const FUNCTION_TAG = 'hello';
    log.debug(TAG, `${FUNCTION_TAG}_EVENT_INIT`);

    const { statusCode } = routeInfo.response;
    return {
        statusCode,
        headers: null,
        body: {
            hello: "hello there traveler"
        },
    };
}

export default {
    hello,
};
```

We created a function called hello and export it. This will be our handler that will be executed
via our API.

### 4. The routing magic

Our hello handler is not the actual function/handler that AWS runs first. The index.js exports this default "handler" that we are talking about.

```js
import { lambdaWrapper } from 'lambda-utils';

import routes from './routes';

export default lambdaWrapper(routes, 'hello');
```

Here we use lambdaWrapper to set up our routes and name
our lambda for logging purposes. This will take care of receiving the AWS event, parsing it, and calling
the corresponding lambda that was set up in routes.js

### Test/Debugging

You can develop and test your lambda functions locally in a few different ways.

### Live-reloading functions

To run the hello function with the event data defined in [`fixtures/event.json`](fixtures/event.json) (with live reloading), run:

```bash
npm run watch:misc:get-app-info
```

### API Gateway-like local dev server

To spin up a local dev server that will more closely match the API Gateway endpoint/experience:

```bash
npm run serve:dev
```

### Adding new functions/files to Webpack

When you add a new function to your serverless config, you don't need to also add it as a new entry
for Webpack. The `serverless-webpack` plugin allows us to follow a simple convention in our `serverless.yml`
file which is uses to automatically resolve your function handlers to the appropriate file:


```yaml
functions:
  hello:
    handler: src/hello.default
```

As you can see, the path to the file with the function has to explicitly say where the handler
file is. (If your function weren't the default export of that file, you'd do something like:
`src/hello.namedExport` instead.)

### Keep your lambda functions warm

Lambda functions will go "cold" if they haven't been invoked for a certain period of time (estimates vary, and AWS doesn't offer a clear answer). From the [Serverless blog](https://serverless.com/blog/keep-your-lambdas-warm/):

> Cold start happens when you execute an inactive (cold) function for the first time. It occurs while your cloud provider provisions your selected runtime container and then runs your function. This process, referred to as cold start, will increase your execution time considerably.

A frequently running function won't have this problem, but you can keep your function running hot by scheduling a regular ping to your lambda function. Here's what that looks like in your `serverless.yml`:

```yaml
functions:
  myFunc:
    handler: src/myFunc.default
    timeout: 10
    memorySize: 256
    events:
      # ...other config happening up here and then...
      # Ping every 5 minutes to avoid cold starts
      - schedule:
          rate: rate(5 minutes)
          enabled: true
```

Your handler function can then handle this event like so:

```javascript
const myFunc = (event, context, callback) => {
  // Detect the keep-alive ping from CloudWatch and exit early. This keeps our
  // lambda function running hot.
  if (event.source === 'aws.events') { // aws.events is the source for Scheduled events
    return callback(null, 'pinged');
  }

  // ... the rest of your function
}

export default myFunc;

```

Copying and pasting the above can be tedious, but we will take care of this if you are using the 
lambdaWraper.