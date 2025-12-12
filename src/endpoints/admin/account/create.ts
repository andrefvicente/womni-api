import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { decode, verify } from '@tsndr/cloudflare-worker-jwt';
import { ulid } from 'ulid';

export class AccountCreate extends OpenAPIRoute {
  schema = {
    tags: ["Account"],
    summary: "Create a new account",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: Str({ description: "Account name" }),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created account",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                account: z.object({
                  id: Str(),
                  name: Str(),
                  partner: Str(),
                  account: Str(),
                  active: Bool(),
                }),
              }),
            }),
          },
        },
      },
      "401": {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: Str(),
            }),
          },
        },
      },
      "400": {
        description: "Bad request",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: Str(),
            }),
          },
        },
      },
    },
  };

  async handle(c) {
    // Get validated data
    const data = await this.getValidatedData<typeof this.schema>();

    // Get token from Authorization header
    const authorization = c.req.header("Authorization");
    if (!authorization) {
      return Response.json(
        {
          success: false,
          error: "Authorization token is required",
        },
        {
          status: 401,
        }
      );
    }

    const token = authorization.replace("Bearer ", "").trim();
    if (!token) {
      return Response.json(
        {
          success: false,
          error: "Invalid authorization token",
        },
        {
          status: 401,
        }
      );
    }

    // Verify and decode token
    if (!c.env.JWT_SECRET_KEY) {
      return Response.json(
        {
          success: false,
          error: "JWT_SECRET_KEY is not configured",
        },
        {
          status: 500,
        }
      );
    }

    const isValid = await verify(token, c.env.JWT_SECRET_KEY);
    if (!isValid) {
      return Response.json(
        {
          success: false,
          error: "Invalid or expired token",
        },
        {
          status: 401,
        }
      );
    }

    const { payload } = decode(token);
    const employeeId: string = payload["employeeId"] as string;

    if (!employeeId) {
      return Response.json(
        {
          success: false,
          error: "Token does not contain employeeId",
        },
        {
          status: 401,
        }
      );
    }

    // Get account name from request body
    const { name } = data.body;

    if (!name || name.trim().length === 0) {
      return Response.json(
        {
          success: false,
          error: "Account name is required",
        },
        {
          status: 400,
        }
      );
    }

    // Generate slug from name: remove special chars, spaces, convert to lowercase
    const accountSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '') // Remove all non-alphanumeric characters
      .replace(/\s+/g, ''); // Remove all spaces (redundant but safe)

    if (accountSlug.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Account name must contain at least one alphanumeric character",
        },
        {
          status: 400,
        }
      );
    }

    // Check if account slug already exists
    const existingAccount = await c.env.DB_WOMNI.prepare(`
      SELECT id FROM account WHERE account = ?
    `).bind(accountSlug).run();

    if (existingAccount.results && existingAccount.results.length > 0) {
      return Response.json(
        {
          success: false,
          error: "An account with this name already exists",
        },
        {
          status: 409,
        }
      );
    }

    // Generate account ID
    const accountId = ulid();

    // Default partner
    const partner = "nutsoft";

    // Get current timestamp for employee_account
    const now = new Date().toISOString();

    // Insert into account table
    const accountResult = await c.env.DB_WOMNI.prepare(`
      INSERT INTO account (
        id, partner, account, name, active
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      accountId,
      partner,
      accountSlug,
      name.trim(),
      1 // active
    ).run();

    if (!accountResult.success) {
      return Response.json(
        {
          success: false,
          error: "Failed to create account",
        },
        {
          status: 500,
        }
      );
    }

    // Insert into employee_account table with ADMIN role
    const employeeAccountResult = await c.env.DB_WOMNI.prepare(`
      INSERT INTO employee_account (
        employeeId, accountId, role, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      employeeId,
      accountId,
      "ADMIN",
      now,
      now
    ).run();

    if (!employeeAccountResult.success) {
      // If employee_account insert fails, we should rollback the account creation
      // However, Cloudflare D1 doesn't support transactions, so we'll just return an error
      // In production, you might want to delete the account here
      return Response.json(
        {
          success: false,
          error: "Failed to associate employee with account",
        },
        {
          status: 500,
        }
      );
    }

    // Return the created account
    return {
      success: true,
      result: {
        account: {
          id: accountId,
          name: name.trim(),
          partner,
          account: accountSlug,
          active: true,
        },
      },
    };
  }
}

