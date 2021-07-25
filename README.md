# Serverless WebRTC Video Chat Sample

This project shows how to implement a simple Video Chat application using serverless technologies like:
- [AWS Cognito](https://aws.amazon.com/cognito/) for authentication;
- [AWS Lambda](https://aws.amazon.com/lambda/) and [AWS API Gateway](https://aws.amazon.com/api-gateway/) in the back-end;
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/) as our data-store;
- [React](https://reactjs.org/) and WebRTC on the front-end;

You can get more details about this application in this [blog post](https://blog.mauriciomaia.dev/programming/video-chat/).

## Prerequisites

To compile the project, check if your environment has the following requirements installed:

1. [Node.js](https://nodejs.org/) v12.x or later
2. [npm](https://www.npmjs.com/) v5.x or later
3. [AWS CLI](https://aws.amazon.com/pt/cli/)

# Building Steps

- Install the Serverless CLI:

```bash
$ npm install -g serverless
````

- Configure a AWS profile with programatic access to the AWS API with full administrator privileges. The next command will assume the profile is called `serverless`;

- Set the environment variables inside the back-end's `serverless.yml` file;

- Deploy the application to the cloud with:

```bash
$ sls deploy --aws-profile serverless
````

- Configure the base URL of each back-end's endpoint inside the frontend's `env.ts`;

- Start the frontend with:

```bash
$ npm start
```
