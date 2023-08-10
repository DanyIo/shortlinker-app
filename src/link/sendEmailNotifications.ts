import { APIGatewayProxyResult } from "aws-lambda";
import { sesClient } from "../utils/sesClient";

const verifiedEmail = process.env.VERIFIED_EMAIL;

export const sendEmailNotifications = async (
  event
): Promise<APIGatewayProxyResult> => {
  try {
    const emailPromises = event.Records.map((record) => {
      const item = JSON.parse(record.body);

      const params = {
        Destination: {
          ToAddresses: [item.email],
        },
        Message: {
          Body: {
            Text: {
              Data: `Your short link ${item.id} has expired.`,
            },
          },
          Subject: {
            Data: "Short Link Expiration Notification",
          },
        },
        Source: `${verifiedEmail}`,
      };

      return sesClient.sendEmail(params);
    });

    await Promise.all(emailPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Email notifications sent successfully.",
      }),
    };
  } catch (error) {
    console.error("Error sending email notifications:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred while sending email notifications.",
      }),
    };
  }
};
