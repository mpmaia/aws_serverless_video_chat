import { APIGatewayProxyEvent } from 'aws-lambda'
import { createLogger } from '../utils/logger'
import * as AWS from 'aws-sdk';
import {ConnectionDAO} from "../db/ConnectionDAO";
import {ConnectionItem} from "../models/ConnectionItem";

const logger = createLogger('webSocket');
const connectionDAO = new ConnectionDAO(logger);

const broadcastClients = async (connectionId: string, url: string, payload: any) => {
    const activeConnections = await connectionDAO.getAll();
    const promises = [];
    activeConnections.forEach(conn => {
        if(conn.connectionId!==connectionId) {
            logger.info("Broadcasting message to: " + url, conn);
            promises.push(sendMessageToClient(url, conn.connectionId, payload));
        }
    });
    try {
        await Promise.all(promises);
    } catch(e) {
        logger.error("broadcastError: ", e);
    }
}

const getCallbackUrl = (event: APIGatewayProxyEvent): string =>  {
    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;
    return `https://${domain}/${stage}`;
}

const sendMessageToClient = (url: string, connectionId: string, payload: any) => {
    logger.info("sendMessageToClient: " + url + " conn: " + connectionId, payload)
    return new Promise((resolve, reject) => {
        const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: url,
        });
        apigatewaymanagementapi.postToConnection(
            {
                ConnectionId: connectionId, // connectionId of the receiving ws-client
                Data: JSON.stringify(payload),
            },
            (err, data) => {
                if (err) {
                    logger.error('sendMessageToClient error: ', err);
                    reject(err);
                } else {
                    logger.error('sendMessageToClient ok: ', data);
                    resolve(data);
                }
            }
        );
    });
}

export const handler = async (event: APIGatewayProxyEvent) => {
    const connectionId = event.requestContext.connectionId;
    const route = event.requestContext.routeKey;
    const userId = event.requestContext.authorizer.principalId;

    logger.info('websocket handler: ' + route, event);

    if(route=="$connect") {
        await connectionDAO.create({userId, connectionId});
        await broadcastClients(connectionId, getCallbackUrl(event), {type: 'connected', payload: { userId }})
    } else if (route=="$disconnect") {
        await connectionDAO.delete(userId, connectionId);
        await broadcastClients(connectionId, getCallbackUrl(event), {type: 'disconnected', payload: { userId }})
    }

    return {
        statusCode: 200,
        body: connectionId
    };
};

export const defaultHandler = async (event: APIGatewayProxyEvent) => {
    const connectionId = event.requestContext.connectionId;
    const userId = event.requestContext.authorizer.principalId;
    logger.info('websocket defaultHandler: ', event);
    const callbackUrlForAWS = getCallbackUrl(event);

    const body = JSON.parse(event.body);
    if(body.action==="rtc" && body.destination) {
        const connections: ConnectionItem[] | null = await connectionDAO.getByUserId(body.destination);
        console.log("Connections: ", connections);
        if(connections) {
            for(let conn of connections) {
                await sendMessageToClient(callbackUrlForAWS, conn.connectionId, {...body, from: userId});
            }
        }
    } else {
        //echo
        await sendMessageToClient(callbackUrlForAWS, connectionId, {...body, from: userId});
    }

    return {
        statusCode: 200,
    };
};
