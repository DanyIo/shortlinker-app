import { User } from "../types/types";
import { dynamoDb } from "./dynamoDb";

async function getUserByEmail(email: string): Promise<User | null> {
  const params = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Key: {
      primary_key: email,
    },
  };

  try {
    const result = await dynamoDb.get(params);

    if (result.Item) {
      const user: User = result.Item as User;
      return user;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user by email:", error);

    return null;
  }
}
export default getUserByEmail;
