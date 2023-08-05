import { APIGatewayProxyHandler, APIGatewayEvent } from "aws-lambda";
import { dynamoDb } from "../utils/dynamoDb";

export const listUserLinks: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
) => {
  try {
    const userEmail = event.requestContext.authorizer?.principalId as string;

    const params = {
      TableName: process.env.DYNAMODB_LINKS_TABLE,
      FilterExpression: "ownerEmail = :email",
      ExpressionAttributeValues: {
        ":email": userEmail,
      },
    };

    const result = await dynamoDb.scan(params);

    const links = result.Items || [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        links,
      }),
    };
  } catch (error) {
    console.error("Error listing links:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred while listing links.",
        error: `${error}`,
      }),
    };
  }
};
