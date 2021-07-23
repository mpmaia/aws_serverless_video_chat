import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createResponse, getUserId } from '../utils/http'
import { createLogger } from '../utils/logger'
import { ContactDAO } from '../db/ContactDAO'
import {AddContactRequest} from "../models/AddContactRequest";
import {UserDAO} from "../db/UserDAO";
import {ContactItem} from "../models/ContactItem";

const logger = createLogger('addContact');
const contactDAO = new ContactDAO(logger);
const userDAO = new UserDAO(logger);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("addContact: ", event);
    const newContactReq: AddContactRequest = JSON.parse(event.body);
    const user = await userDAO.getByEmail(newContactReq.email);
    if(user===null) {
        return createResponse(404, "User not found");
    }
    logger.info("addContact user: ", user);
    const newContact: ContactItem = {userId: getUserId(event), contactUserId: user.userId, contactEmail: user.email, createdAt: new Date().toISOString()};
    await contactDAO.create(newContact);
    const result = await contactDAO.getByUserId(getUserId(event));
    logger.info("addContact result: ", result);
    return createResponse(200, {items: result});
}
