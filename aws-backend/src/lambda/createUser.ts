import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import {createResponse, getUserEmail, getUserId} from '../utils/http'
import { createLogger } from '../utils/logger'
import { UserDAO } from '../db/UserDAO'

const logger = createLogger('createUser');
const userDAO = new UserDAO(logger);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const email = getUserEmail(event);
    logger.info("createUser: ", event);
    let user = null;
    try {
        user = await userDAO.get(userId);
    } catch(e) {
        logger.info("createUser  error: ", e);
    }

    if(user===null) {
        user = {userId, email, createdAt: new Date().toISOString()}
        await userDAO.create(user);
    }

    return createResponse(200, {item: user});
}
