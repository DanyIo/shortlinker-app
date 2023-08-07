import { APIGatewayEvent } from "aws-lambda";
import { dynamoDb } from "../utils/dynamoDb";
import {
  createNewScheduleCommand,
  schedulerClient,
} from "../utils/eventBridgeClient";
import { CreateScheduleCommand } from "@aws-sdk/client-scheduler";

const SHORT_LINK_LENGTH = 6;
const deploymentURL = process.env.DEPLOYMENT_URL

export const createShortLink = async (event: APIGatewayEvent) => {
  try {
    const { originalLink, expirationTime } = JSON.parse(event.body);
    const userEmail = event.requestContext.authorizer?.principalId;

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
          error,
        }),
      };
    }
    if (formattedExpirationTime !== "one-time") {
      const newSchedule = createNewScheduleCommand({
        time: formattedExpirationTime.split(".")[0],
        email: userEmail,
        id: shortId,
      });
      try {
        await schedulerClient.send(new CreateScheduleCommand(newSchedule));
      } catch (error) {
        console.error("Error scheduling link deletion:", error);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "An error occurred while scheduling the link deletion.",
          }),
        };
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        link: `${deploymentURL}${shortId}`,
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

function generateShortId(length) {
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

function formatExpirationTime(expirationTime) {
  const durationMap = {
    "one-time": 0,
    "1 day": 1 * 24 * 60 * 60,
    "3 days": 3 * 24 * 60 * 60,
    "7 days": 7 * 24 * 60 * 60,
  };

  const duration = durationMap[expirationTime];

  if (typeof duration !== "undefined") {
    if (duration === 0) {
      return "one-time";
    }

    const expirationDate = new Date(Date.now() + duration * 1000);
    return expirationDate.toISOString();
  }

  throw new Error("Invalid expiration time format.");
}
