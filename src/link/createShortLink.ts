import { APIGatewayProxyHandler, APIGatewayEvent } from "aws-lambda";
import { dynamoDb } from "../utils/dynamoDb";

const SHORT_LINK_LENGTH = 6;

interface ICreateShortLink {
  originalLink: string;
  expirationTime: "one-time" | "1 day" | "3 days" | "7 days";
}

export const createShortLink: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
) => {
  try {
    const { originalLink, expirationTime } = JSON.parse(
      event.body
    ) as ICreateShortLink;
    const userEmail = event.requestContext.authorizer?.principalId as string;

    if (!originalLink || !expirationTime) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Both originalLink and expirationTime are required.",
        }),
      };
    }

    const shortId = generateShortId(SHORT_LINK_LENGTH);
    const formattedExpirationTime = formatExpirationTime(expirationTime);

    const shortenedLink = {
      TableName: process.env.DYNAMODB_LINKS_TABLE,
      Item: {
        id: shortId,
        ownerEmail: userEmail,
        originalLink,
        expirationTime: formattedExpirationTime,
        visitCount: 0,
      },
    };

    try {
      await dynamoDb.put(shortenedLink);
    } catch (error) {
      console.error("Error putting item to DynamoDB:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "An error occurred while creating the short link.",
        }),
      };
    }

    const shortURL = generateShortUrl(
      event.headers,
      event.requestContext,
      shortId
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        link: shortURL,
      }),
    };
  } catch (error) {
    console.error("Error parsing request or generating short link:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid request body.",
      }),
    };
  }
};

function generateShortId(length: number): string {
  const characterSet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = characterSet.length;

  let shortId = "";
  let num = Date.now();

  while (num > 0) {
    const remainder = num % base;
    shortId = characterSet.charAt(remainder) + shortId;
    num = Math.floor(num / base);
  }

  while (shortId.length < length) {
    shortId = characterSet.charAt(0) + shortId;
  }

  return shortId;
}

const generateShortUrl = (
  headers: APIGatewayEvent["headers"],
  requestContext: APIGatewayEvent["requestContext"],
  shortId: string
): string => {
  const proto = "https://";
  const host = headers?.Host ?? "";
  const path = requestContext?.path ?? "/";
  return `${proto}${host}${path}${shortId}`;
};

function formatExpirationTime(expirationTime: string): string {
  const durationMap: { [key: string]: number } = {
    "one-time": 0,
    "1 day": 1,
    "3 days": 3,
    "7 days": 7,
  };

  const now = new Date();
  const duration = durationMap[expirationTime];

  if (typeof duration !== "undefined") {
    if (duration === 0) {
      return "one-time";
    }

    const expirationDate = new Date(
      now.getTime() + duration * 24 * 60 * 60 * 1000
    );
    return expirationDate.toISOString();
  }

  throw new Error("Invalid expiration time format.");
}
