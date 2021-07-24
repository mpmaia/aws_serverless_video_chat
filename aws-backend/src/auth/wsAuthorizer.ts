import {CustomAuthorizerEvent} from "aws-lambda";
import {createLogger} from "../utils/logger";
import {verifyToken} from "./jwt";

const logger = createLogger('authWS')

export const handler =  async function(event: CustomAuthorizerEvent, context, callback) {
    logger.info("wsAuthorizer: ", event, context);
    try {
        const jwtToken = await verifyToken(event.queryStringParameters.Auth, false);
        const allow = {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        };
        logger.info("role: ", allow);
        callback(null, allow);
    } catch (e) {
        console.log(e);
        callback("Access denied");
    }
};
