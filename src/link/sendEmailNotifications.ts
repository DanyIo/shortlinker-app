import { SES } from "aws-sdk";
import { APIGatewayProxyResult } from "aws-lambda";

const ses = new SES();
const verifiedEmail = process.env.VERIFIED_EMAIL;

export const sendEmailNotifications = async (
  event
): Promise<APIGatewayProxyResult> => {
  try {
    const emailPromises = event.Records.map((record) => {
      const item = JSON.parse(record.body);

      const params: SES.SendEmailRequest = {
        Destination: {
          ToAddresses: [item.ownerEmail],
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

      return ses.sendEmail(params).promise();
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
