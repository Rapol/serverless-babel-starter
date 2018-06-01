import { lambdaWrapper } from 'lambda-utils';

import routes from './routes';

export default lambdaWrapper(routes, 'MISC', {
    dbConnection: false,
});
