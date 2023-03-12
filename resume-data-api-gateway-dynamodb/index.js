const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    try {
        const parameters = {
            TableName: "resume-data"
        };
        switch (event.httpMethod) {
            case 'GET':
                body = await dynamo.query(Object.assign({}, parameters, {
                    ReturnConsumedCapacity:"TOTAL",
                    KeyConditionExpression:"#u = :user",
                    ExpressionAttributeNames:{"#u":"user"},
                    ExpressionAttributeValues:{":user":event.pathParameters.user}
                })).promise();
                break;
            case 'POST':
                validateUserAccess(event);
                body = await dynamo.put(Object.assign({}, parameters, {
                    Item: JSON.parse(event.body)
                })).promise();
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '401';
        console.log(err);
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};

function validateUserAccess(event) {
    const editedUser = event.pathParameters.user;
    const requestingUser = event.requestContext.authorizer.claims.email;
    const groups = event.requestContext.authorizer.claims["cognito:groups"];
    
    if (groups.includes("entry/edit/any")) {
        return;
    }
    throw new Error(`Requesting user "${requestingUser}" does not have permission to edit entries belonging to "${editedUser}"`);
}
