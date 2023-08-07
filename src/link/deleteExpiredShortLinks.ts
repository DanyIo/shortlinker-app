import { APIGatewayProxyHandler, APIGatewayEvent } from "aws-lambda";
import { DeleteScheduleCommand } from "@aws-sdk/client-scheduler";
import { dynamoDb } from "../utils/dynamoDb";
import { schedulerClient } from "../utils/eventBridgeClient";
import { sqsClient } from "../utils/notifications";

const queueUrl = process.env.THE_QUEUE_URL;

interface IDeleteExpiredShortLink {
  id: string;
  email: string;
}

export const deleteExpiredShortLinks: APIGatewayProxyHandler = async (
  data: IDeleteExpiredShortLink
) => {
  try {
    const { id, email } = data;

    const deleteParams = {
      TableName: process.env.DYNAMODB_LINKS_TABLE,
      Key: {
        id,
      },
    };

    const sqsParams = {
      MessageBody: JSON.stringify({
        id,
        email,
      }),
      QueueUrl: `${queueUrl}`,
    };
    try {
      await dynamoDb.delete(deleteParams);
      await sqsClient.sendMessage(sqsParams).promise();

      await schedulerClient.send(
        new DeleteScheduleCommand({
          Name: `expired_link_id-${id}`,
          GroupName: "deleteLink",
        })
      );
    } catch (error) {
      console.error("Error deleting item from DynamoDB:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "An error occurred while deleting the short link.",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Short link deleted successfully.",
      }),
    };
  } catch (error) {
    console.error("Error parsing request or deleting short link:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid request body.",
      }),
    };
  }
};
