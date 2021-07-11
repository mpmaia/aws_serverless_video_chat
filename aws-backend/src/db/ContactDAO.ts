import { ContactItem } from '../models/ContactItem';
import {CONTACTS_TABLE, USER_ID_INDEX} from '../utils/env';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import * as winston from 'winston';

const XAWS = AWSXRay.captureAWS(AWS);

export class ContactDAO {

  private docClient = new XAWS.DynamoDB.DocumentClient();
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  public async create(contact: ContactItem): Promise<ContactItem> {
    const response = await this.docClient.put({
      TableName: CONTACTS_TABLE,
      Item: contact
    }).promise();
    this.logger.info("ContactDAO create: ", response);
    return contact;
  }

  public async delete(userId: string, contactUserId: string): Promise<boolean> {
    const result = await this.docClient.delete({
      TableName: CONTACTS_TABLE,
      Key: {
        contactUserId,
        userId
      }
    }).promise()
    this.logger.info("ContactDAO delete: ", result);
    return !result.$response.error;
  }

  public async getByUserId(userId: string): Promise<ContactItem[]> {
    const result = await this.docClient.query({
      TableName: CONTACTS_TABLE,
      IndexName: USER_ID_INDEX,
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues: {
        ':u': userId
      }
    }).promise();
    this.logger.info("ContactDAO getByUserId: ", result);
    return result.Items as ContactItem[];
  }
}
