# ShortLinker

ShortLinker is a serverless web application that allows users to create short links for long URLs. It is built using the Serverless Framework, AWS Lambda, Amazon DynamoDB, Amazon API Gateway, Amazon SQS, and Amazon SES. The application provides a simple and efficient way to generate short links for sharing and tracking purposes.

## Features

- User registration and login: Users can register and log in to the ShortLinker application using their email and password.
- Create short links: Authenticated users can create short links for long URLs, making it easier to share them.
- Redirect short links: ShortLinker automatically redirects users to the original long URL when they access the generated short link.
- List user links: Authenticated users can view a list of their created short links along with their corresponding long URLs.
- Delete short links: Users have the option to delete their short links when they are no longer needed.
- Expiration time for short links: Users can set an expiration time for their short links. After the specified time, the short link will no longer be accessible.
- Email notifications: ShortLinker sends email notifications to users when their short links expire.

## Getting Started

### Prerequisites

Before running the ShortLinker application, make sure you have the following installed:

- Node.js and npm
- AWS CLI with appropriate credentials set up

### Installation

1. Clone the ShortLinker repository:

```
git clone <repository_url>
cd shortlinker-app
```

2. Install the required dependencies:

```
npm install
```

3. Configure Environment Variables:

   - Create a `.env` file in the root directory of the project.
   - Add the following environment variables and set their values accordingly:

     ```
     VERIFIED_EMAIL=<your_verified_email>
     JWT_SECRET=<your_jwt_secret>
     ```

4. Deploy the application:

```
serverless deploy
```

### Usage

Once the application is deployed, you can access the ShortLinker API endpoints using the provided base URL. The following API endpoints are available:

- POST /register: Register a new user with the application.
- POST /login: Log in to the application with registered credentials.
- POST /: Create a short link for a long URL (requires authentication).
- GET /links: Get a list of user-created short links (requires authentication).
- GET /{id}: Redirect to the original long URL associated with the short link.
- DELETE /{id}: Delete a user-created short link (requires authentication).

### Expiration Time

When creating a short link, you can specify an expiration time for the link. The available options are "one-time," "1 day," "3 days," and "7 days." If "one-time" is chosen, the short link will be valid only for a single access.

### Email Notifications

ShortLinker sends email notifications to users when their short links expire. The notification is sent using Amazon SES, so make sure you have your email address verified in SES to receive email notifications.

## Architecture

The ShortLinker application is built using a serverless architecture on AWS. It leverages various AWS services, including AWS Lambda, Amazon DynamoDB, Amazon API Gateway, Amazon SQS, and Amazon SES.

### AWS Services Used

- AWS Lambda: Handles the business logic of the application, including user registration, login, short link creation, and redirection.
- Amazon DynamoDB: Stores user data and short link information.
- Amazon API Gateway: Provides RESTful API endpoints to interact with the application.
- Amazon SQS: Used for asynchronous processing of expired short links and sending email notifications.
- Amazon SES: Sends email notifications to users when their short links expire.

## Acknowledgments

Thank you for using ShortLinker! If you have any questions or need assistance, please don't hesitate to reach out to us. Happy linking!
