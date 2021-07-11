import {CONNECTIONS_TABLE} from '../utils/env';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import * as winston from 'winston';
import {ConnectionItem} from "../models/ConnectionItem";

const XAWS = AWSXRay.captureAWS(AWS);

export class ConnectionDAO {

    private docClient = new XAWS.DynamoDB.DocumentClient();
    private logger: winston.Logger;

    constructor(logger: winston.Logger) {
        this.logger = logger;
    }

    public async create(conn: ConnectionItem): Promise<ConnectionItem> {
        const response = await this.docClient.put({
            TableName: CONNECTIONS_TABLE,
            Item: conn
        }).promise();
        this.logger.info("ConnectionDAO create: ", response);
        return conn;
    }

    public async delete(userId: string, connectionId: string): Promise<boolean> {
        const result = await this.docClient.delete({
            TableName: CONNECTIONS_TABLE,
            Key: {
                userId,
                connectionId
            }
        }).promise();
        this.logger.info("ConnectionDAO delete: ", result);
        return !result.$response.error;
    }

    public async get(userId: string, connectionId: string): Promise<ConnectionItem> {
        const result = await this.docClient.get({
            TableName: CONNECTIONS_TABLE,
            Key: {
                userId,
                connectionId
            }
        }).promise();
        this.logger.info("ConnectionDAO get: ", result);
        return result.Item as ConnectionItem;
    }

    public async getAll(): Promise<ConnectionItem[]> {
        const result = await this.docClient.scan({
            TableName: CONNECTIONS_TABLE
        }).promise();
        this.logger.info("ConnectionDAO scan: ", result);
        return result.Items as ConnectionItem[];
    }

    public async getByUserId(userId: string): Promise<ConnectionItem[] | null> {
        const result = await this.docClient.query({
            TableName: CONNECTIONS_TABLE,
            KeyConditionExpression: 'userId = :e',
            ExpressionAttributeValues: {
                ':e': userId
            }
        }).promise();
        this.logger.info("ConnectionDAO getByUserId: ", result);
        if(result.Count>0) {
            return result.Items as ConnectionItem[];
        } else {
            return null;
        }
    }
}
