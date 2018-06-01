import handlers from './handlers';

export default {
    '/app-info': {
        GET: {
            handler: handlers.appInfo,
            response: {
                headers: {},
                statusCode: 200,
            },
        },
    },
};
