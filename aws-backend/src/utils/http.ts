import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

export function getUserId(event: APIGatewayProxyEvent): string | null {
    const claims = event.requestContext.authorizer.claims;
    if(!claims) {
        return null;
    }
    return claims.sub as string;
}

export function getUserEmail(event: APIGatewayProxyEvent): string | null {
    const claims = event.requestContext.authorizer.claims;
    if(!claims) {
        return null;
    }
    return claims.email as string;
}

export function createResponse(httpCode: number, data?: any): APIGatewayProxyResult {
    const response = {
        statusCode: httpCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: data?JSON.stringify(data):null
    }
    return response;
}
