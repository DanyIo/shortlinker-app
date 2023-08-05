import { APIGatewayProxyHandler } from "aws-lambda";
import { dynamoDb } from "../utils/dynamoDb";
import getUserByEmail from "../utils/getUserByEmail";
import { User } from "../types/api-types";
import { generateJwtToken } from "../utils/jwtToken";
import { hash } from "bcryptjs";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register: APIGatewayProxyHandler = async (event) => {
  try {
    const body: User = JSON.parse(event.body);

    if (!body.email || !body.password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Email and password are required for registration",
        }),
      };
    }

    if (!emailRegex.test(body.email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid email format",
        }),
      };
    }

    if (body.password.length < 7) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Password must be at least 7 characters long",
        }),
      };
    }

    const existingUser = await getUserByEmail(body.email);
    if (existingUser) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "Email already registered" }),
      };
    }

    const saltRounds = 10;
    const hashedPassword = await hash(body.password, saltRounds);

    const putParams = {
      TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
      Item: {
        primary_key: body.email,
        password: hashedPassword,
      },
    };

    await dynamoDb.put(putParams);

    const jwtToken = generateJwtToken(body.email);

    return {
      statusCode: 201,
      body: JSON.stringify({
        token: jwtToken,
      }),
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred during registration",
      }),
    };
  }
};
