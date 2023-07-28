import { APIGatewayProxyHandler, APIGatewayEvent } from "aws-lambda";
import { dynamoDb } from "../utils/dynamoDb";

export const deleteLinkByID: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
) => {
  const userEmail = event.requestContext.authorizer?.principalId as string;

  try {
    const { id } = event.pathParameters;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Short ID is required.",
        }),
      };
    }

    const getParams = {
      TableName: process.env.DYNAMODB_LINKS_TABLE,
      Key: {
        id: id,
      },
    };

    const link = await dynamoDb.get(getParams);

    if (!link.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Link not found.",
        }),
      };
    }

    if (link.Item.ownerEmail !== userEmail) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Forbidden: You are not the owner of this link.",
        }),
      };
    }

    const deleteParams = {
      TableName: process.env.DYNAMODB_LINKS_TABLE,
      Key: {
        id: id,
      },
    };

    await dynamoDb.delete(deleteParams);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Short link deleted successfully.",
      }),
    };
  } catch (error) {
    console.error("Error deleting short link:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred while deleting the short link.",
      }),
    };
  }
};
