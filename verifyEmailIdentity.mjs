import {
  SESClient,
  VerifyEmailIdentityCommand,
  GetIdentityVerificationAttributesCommand,
} from "@aws-sdk/client-ses";

const clientConfig = {
  region: process.env.REGION,
};

const client = new SESClient(clientConfig);

const email = process.env.VERIFIED_EMAIL ?? "";

const verifyEmailIdentity = async () => {
  try {
    const response = await client.send(
      new GetIdentityVerificationAttributesCommand({
        Identities: [email],
      })
    );

    const isEmailVerified = response?.VerificationAttributes?.[email];
    if (isEmailVerified) {
      console.log(`${email} is already verified.`);
      return;
    }

    await client.send(
      new VerifyEmailIdentityCommand({
        EmailAddress: email,
      })
    );

    console.log(`${email} was successfully verified.`);
    console.log("Check your email for the verification request.");
  } catch (error) {
    console.error("Error verifying email:", error.message);
  }
};

verifyEmailIdentity();
