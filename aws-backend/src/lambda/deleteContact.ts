import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createResponse, getUserId } from '../utils/http'
import { createLogger } from '../utils/logger'
import { ContactDAO } from '../db/ContactDAO'
import {ConnectionDAO} from "../db/ConnectionDAO";
import {ContactItemOnline} from "../models/ContactItem";

const logger = createLogger('deleteContact');
const contactDAO = new ContactDAO(logger);
const connectionDAO = new ConnectionDAO(logger);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info("deleteContact: ", event);

    const contactId = decodeURIComponent(event.pathParameters.contactId);
    const userId = getUserId(event);

    logger.info("deleting: " + userId + " " + contactId);

    await contactDAO.delete(userId, contactId)

    const contacts: ContactItemOnline[] = await contactDAO.getByUserId(userId);
    logger.info("Contacts: ", contacts);
    if(contacts && contacts.length>0) {
        for(let contact of contacts) {
            const conn = await connectionDAO.getByUserId(contact.contactUserId);
            logger.info("Contact " + contact.contactUserId + " online " + !!conn);
            contact.online = !!conn;
        }
    }
    return createResponse(200, {items: contacts});
}
