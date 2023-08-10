import { APIGatewayProxyHandler } from "aws-lambda";
import { generateJwtToken } from "../utils/jwtToken";
import getUserByEmail from "../utils/getUserByEmail";
import { User } from "../types/api-types";
import { compare } from "bcryptjs";

export const login: APIGatewayProxyHandler = async (event) => {
  try {
    const body: User = JSON.parse(event.body);

    if (!body.email || !body.password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Email and password are required for login",
        }),
      };
    }

    const user = await getUserByEmail(body.email);
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    const isPasswordValid = await verifyPassword(body.password, user.password);
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid password" }),
      };
    }

    const jwtToken = generateJwtToken(body.email);

    return {
      statusCode: 200,
      body: JSON.stringify({ token: jwtToken }),
    };
  } catch (error) {
    console.error("Error during login:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const isPasswordValid = await compare(plainPassword, hashedPassword);
    return isPasswordValid;
  } catch (error) {
    console.error("Error during password verification:", error);
    return false;
  }
}
