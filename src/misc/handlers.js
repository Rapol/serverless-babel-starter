import { log, utils } from 'lambda-utils';
import { say as cowsay } from 'cowsay';

const TAG = 'misc::handlers';

async function appInfo(_event, context, routeInfo) {
    const FUNCTION_TAG = 'GET_APP_INFO';
    log.debug(TAG, `${FUNCTION_TAG}_EVENT_INIT`);

    const { statusCode } = routeInfo.response;
    return {
        statusCode,
        headers: null,
        body: {
            status: statusCode,
            data: {
                minimumAppVersion: process.env.MIN_APP_VERSION,
                configTimeout: 30,
                cowsay: cowsay({ text: 'The server is in another castle' }),
            },
        },
    };
}

export default {
    appInfo,
};
