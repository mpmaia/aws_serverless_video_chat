import {USER_EMAIL_INDEX, USERS_TABLE} from '../utils/env';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import * as winston from 'winston';
import { UserItem } from '../models/UserItem';

const XAWS = AWSXRay.captureAWS(AWS);

export class UserDAO {

  private docClient = new XAWS.DynamoDB.DocumentClient();
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  public async create(user: UserItem): Promise<UserItem> {
    const response = await this.docClient.put({
      TableName: USERS_TABLE,
      Item: user
    }).promise();
    this.logger.info("UserDAO create: ", response);
    return user;
  }

  public async get(userId: string): Promise<UserItem> {
    const result = await this.docClient.get({
      TableName: USERS_TABLE,
      Key: {
        userId
      }
    }).promise();
    this.logger.info("UserDAO getByUserId: ", result);
    return result.Item as UserItem;
  }

  public async getByEmail(email: string): Promise<UserItem | null> {
    const result = await this.docClient.query({
      TableName: USERS_TABLE,
      IndexName: USER_EMAIL_INDEX,
      KeyConditionExpression: 'email = :e',
      ExpressionAttributeValues: {
        ':e': email
      }
    }).promise();
    this.logger.info("UserDAO getByEmail: ", result);
    if(result.Count>0) {
      return result.Items[0] as UserItem;
    } else {
      return null;
    }
  }
}
