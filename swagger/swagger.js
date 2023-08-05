// this file was generated by serverless-auto-swagger
module.exports = {
  swagger: "2.0",
  info: {
    title: "shortlink",
    version: "1",
  },
  paths: {
    "/register": {
      post: {
        summary: "registerUser",
        description: "",
        operationId: "registerUser.post./register",
        consumes: ["application/json"],
        produces: ["application/json"],
        security: [
          {
            Authorization: [],
          },
        ],
        parameters: [
          {
            in: "body",
            name: "body",
            description: "Body required in the request",
            required: true,
            schema: {
              $ref: "#/definitions/User",
            },
          },
        ],
        responses: {
          201: {
            description: "New user registered",
            schema: {
              $ref: "#/definitions/Token",
            },
          },
          400: {
            description: "Invalid body params",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          409: {
            description: "User already exists",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          500: {
            description: "Server error",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
        },
      },
    },
    "/login": {
      post: {
        summary: "loginUser",
        description: "",
        operationId: "loginUser.post./login",
        consumes: ["application/json"],
        produces: ["application/json"],
        security: [
          {
            Authorization: [],
          },
        ],
        parameters: [
          {
            in: "body",
            name: "body",
            description: "Body required in the request",
            required: true,
            schema: {
              $ref: "#/definitions/User",
            },
          },
        ],
        responses: {
          200: {
            description: "Login successful",
            schema: {
              $ref: "#/definitions/Token",
            },
          },
          400: {
            description: "Invalid body params",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          401: {
            description: "Invalid password",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          404: {
            description: "User not found",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          500: {
            description: "Internal server error",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
        },
      },
    },
    "/": {
      post: {
        summary: "createShortLink",
        description: "",
        operationId: "createShortLink.post./",
        consumes: ["application/json"],
        produces: ["application/json"],
        security: [
          {
            Authorization: [],
          },
        ],
        parameters: [
          {
            in: "body",
            name: "body",
            description: "Body required in the request",
            required: true,
            schema: {
              $ref: "#/definitions/ICreateShortLink",
            },
          },
        ],
        responses: {
          200: {
            description: "Short link created successfully",
            schema: {
              $ref: "#/definitions/Link",
            },
          },
          400: {
            description: "Invalid request body",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          500: {
            description: "An error occurred while creating the short link",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
        },
      },
    },
    "/{id}": {
      get: {
        summary: "redirectShortLink",
        description: "",
        operationId: "redirectShortLink.get./{id}",
        consumes: ["application/json"],
        produces: ["application/json"],
        security: [
          {
            Authorization: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "string",
          },
        ],
        responses: {
          302: {
            description: "Redirecting to the original link",
          },
          400: {
            description: "Short link ID is missing in the request.",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          404: {
            description: "Short link not found.",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          500: {
            description: "An error occurred while redirecting the short link.",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
        },
      },
      delete: {
        summary: "deleteLinkByID",
        description: "",
        operationId: "deleteLinkByID.delete./{id}",
        consumes: ["application/json"],
        produces: ["application/json"],
        security: [
          {
            Authorization: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "string",
          },
        ],
        responses: {
          200: {
            description: "Short link deleted successfully",
          },
          400: {
            description: "Short ID is required",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          403: {
            description: "Forbidden: You are not the owner of this link",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          404: {
            description: "Link not found",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
          500: {
            description: "An error occurred while deleting the short link",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
        },
      },
    },
    "/links": {
      get: {
        summary: "listUserLinks",
        description: "",
        operationId: "listUserLinks.get./links",
        consumes: ["application/json"],
        produces: ["application/json"],
        security: [
          {
            Authorization: [],
          },
        ],
        parameters: [],
        responses: {
          200: {
            description: "List of user links",
            schema: {
              $ref: "#/definitions/UserLinkArray",
            },
          },
          500: {
            description: "An error occurred while listing links.",
            schema: {
              $ref: "#/definitions/ErrorStr",
            },
          },
        },
      },
    },
  },
  definitions: {
    User: {
      properties: {
        email: {
          title: "User.email",
          type: "string",
        },
        password: {
          title: "User.password",
          type: "string",
        },
      },
      required: ["email", "password"],
      additionalProperties: false,
      title: "User",
      type: "object",
    },
    Token: {
      properties: {
        token: {
          title: "Token.token",
          type: "string",
        },
      },
      required: ["token"],
      additionalProperties: false,
      title: "Token",
      type: "object",
    },
    ErrorStr: {
      properties: {
        message: {
          title: "ErrorStr.message",
          type: "string",
        },
      },
      required: ["message"],
      additionalProperties: false,
      title: "ErrorStr",
      type: "object",
    },
    ICreateShortLink: {
      properties: {
        originalLink: {
          title: "ICreateShortLink.originalLink",
          type: "string",
        },
        expirationTime: {
          enum: ["one-time", "1 day", "3 days", "7 days"],
          title: "ICreateShortLink.expirationTime",
          type: "string",
        },
      },
      required: ["originalLink", "expirationTime"],
      additionalProperties: false,
      title: "ICreateShortLink",
      type: "object",
    },
    Link: {
      properties: {
        link: {
          title: "Link.link",
          type: "string",
        },
      },
      required: ["link"],
      additionalProperties: false,
      title: "Link",
      type: "object",
    },
    UserLink: {
      properties: {
        id: {
          title: "UserLink.id",
          type: "string",
        },
        ownerEmail: {
          title: "UserLink.ownerEmail",
          type: "string",
        },
        originalLink: {
          title: "UserLink.originalLink",
          type: "string",
        },
        expirationTime: {
          title: "UserLink.expirationTime",
          type: "string",
        },
        visitCount: {
          title: "UserLink.visitCount",
          type: "number",
        },
      },
      required: [
        "id",
        "ownerEmail",
        "originalLink",
        "expirationTime",
        "visitCount",
      ],
      additionalProperties: false,
      title: "UserLink",
      type: "object",
    },
    UserLinkArray: {
      properties: {
        links: {
          items: {
            $ref: "#/definitions/UserLink",
            title: "UserLinkArray.links.[]",
          },
          title: "UserLinkArray.links",
          type: "array",
        },
      },
      required: ["links"],
      additionalProperties: false,
      title: "UserLinkArray",
      type: "object",
    },
  },
  securityDefinitions: {
    Authorization: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  basePath: "/dev",
};
