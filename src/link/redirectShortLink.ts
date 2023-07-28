import { APIGatewayProxyHandler } from "aws-lambda";
import { dynamoDb } from "../utils/dynamoDb";

interface ILinkItem {
  id: string;
  originalLink: string;
  expirationTime: string;
}

export const redirectShortLink: APIGatewayProxyHandler = async (event) => {
  try {
    const shortId = event.pathParameters?.id;
    if (!shortId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Short link ID is missing in the request.",
        }),
      };
    }

    const linkItem = await getLinkItem(shortId);

    if (!linkItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Short link not found.",
        }),
      };
    }

    linkItem.expirationTime === "one-time"
      ? await deleteLinkItem(shortId)
      : await updateVisitCount(shortId);

    return {
      statusCode: 302,
      headers: {
        Location: linkItem.originalLink,
      },
      body: "",
    };
  } catch (error) {
    console.error("Error redirecting short link:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred while redirecting the short link.",
      }),
    };
  }
};

async function getLinkItem(shortId: string): Promise<ILinkItem | null> {
  const params = {
    TableName: process.env.DYNAMODB_LINKS_TABLE,
    Key: {
      id: shortId,
    },
  };

  const result = await dynamoDb.get(params);
  return result.Item as ILinkItem | null;
}

async function updateVisitCount(shortId: string): Promise<void> {
  const params = {
    TableName: process.env.DYNAMODB_LINKS_TABLE,
    Key: {
      id: shortId,
    },
    UpdateExpression: "SET visitCount = visitCount + :inc",
    ExpressionAttributeValues: {
      ":inc": 1,
    },
  };

  await dynamoDb.update(params);
}

async function deleteLinkItem(shortId: string): Promise<void> {
  const params = {
    TableName: process.env.DYNAMODB_LINKS_TABLE,
    Key: {
      id: shortId,
    },
  };

  await dynamoDb.delete(params);
}
