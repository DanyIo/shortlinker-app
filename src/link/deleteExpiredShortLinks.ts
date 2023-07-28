import { SQS } from "aws-sdk";
import { APIGatewayProxyResult } from "aws-lambda";
import { dynamoDb } from "../utils/dynamoDb";

const sqs = new SQS();
const queueUrl = process.env.THE_QUEUE_URL;

export const deleteExpiredShortLinks =
  async (): Promise<APIGatewayProxyResult> => {
    try {
      const params = {
        TableName: process.env.DYNAMODB_LINKS_TABLE,
        FilterExpression: "expirationTime <= :currentTime",
        ExpressionAttributeValues: {
          ":currentTime": new Date().toISOString(),
        },
      };

      const result = await dynamoDb.scan(params);

      if (result.Items && result.Items.length > 0) {
        const deletePromises: Promise<any>[] = [];
        const deleteDbPromises: Promise<any>[] = [];

        for (const item of result.Items) {
          if (item.expirationTime === "one-time") {
            continue;
          }

          const sqsParams: SQS.Types.SendMessageRequest = {
            MessageBody: JSON.stringify({
              id: item.id,
              ownerEmail: item.ownerEmail,
            }),
            QueueUrl: `${queueUrl}`,
          };

          const deleteParams = {
            TableName: process.env.DYNAMODB_LINKS_TABLE,
            Key: {
              id: item.id,
            },
          };

          deletePromises.push(sqs.sendMessage(sqsParams).promise());
          deleteDbPromises.push(dynamoDb.delete(deleteParams));
        }

        await Promise.all(deletePromises);

        await Promise.all(deleteDbPromises);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message:
            "Expired short links have been marked for deletion and notifications sent.",
        }),
      };
    } catch (error) {
      console.error("Error marking expired short links for deletion:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message:
            "An error occurred while marking expired short links for deletion and sending notifications.",
        }),
      };
    }
  };
