import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { sign, verify } from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET ?? "";

interface DecodedToken {
  email: string;
  iat: number;
  exp: number;
}

export function generateJwtToken(email: string): string {
  const payload = { email };
  const jwtOptions = { expiresIn: "1h" };
  return sign(payload, jwtSecret, jwtOptions);
}

export async function verifyToken(
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> {
  try {
    const token = event.authorizationToken.split(" ")[1];

    const decodedToken = verify(token, jwtSecret) as DecodedToken;
    const userEmail = decodedToken?.email;

    if (!userEmail) {
      throw new Error("Invalid token");
    }
    return generatePolicy(userEmail, "Allow", event.methodArn, {
      principalId: userEmail,
    });
  } catch (error) {
    console.error("Error in verifyToken:", error);
    return generatePolicy("user", "Deny", event.methodArn);
  }
}

function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string,
  authorizer?: any
): APIGatewayAuthorizerResult {
  const policy: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
  if (authorizer) {
    policy.context = authorizer;
  }

  return policy;
}
