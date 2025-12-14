import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { decode, verify } from '@tsndr/cloudflare-worker-jwt';
import { ulid } from 'ulid';
import { generateToken } from '../../../helpers/auth';

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

    const authToken = authorization.replace("Bearer ", "").trim();
    if (!authToken) {
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

    // Validate JWT format before attempting to decode
    const parts = authToken.split('.');
    if (parts.length !== 3) {
      return Response.json(
        {
          success: false,
          error: "Invalid token format",
        },
        {
          status: 401,
        }
      );
    }

    // Check if each part is valid base64url
    const base64urlRegex = /^[A-Za-z0-9_-]+=*$/;
    const isValidFormat = parts.every(part => {
      if (!part || part.length === 0) {
        return false;
      }
      const partWithoutPadding = part.replace(/=+$/, '');
      return base64urlRegex.test(partWithoutPadding);
    });

    if (!isValidFormat) {
      return Response.json(
        {
          success: false,
          error: "Invalid token format",
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

    const isValid = await verify(authToken, c.env.JWT_SECRET_KEY);
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

    let payload;
    try {
      const decoded = decode(authToken);
      payload = decoded.payload;
    } catch (error: any) {
      // Handle base64 decoding errors
      return Response.json(
        {
          success: false,
          error: "Invalid token: " + (error.message || "Failed to decode token"),
        },
        {
          status: 401,
        }
      );
    }
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

    // Generate ULID for employee_account id
    const employeeAccountId = ulid();

    // Use batch operation to ensure atomicity - both inserts succeed or both fail
    // Cloudflare D1 batch operations are atomic and will rollback on any failure
    try {
      const results = await c.env.DB_WOMNI.batch([
        c.env.DB_WOMNI.prepare(`
          INSERT INTO account (
            id, partner, account, name, active
          ) VALUES (?, ?, ?, ?, ?)
        `).bind(
          accountId,
          partner,
          accountSlug,
          name.trim(),
          1 // active
        ),
        c.env.DB_WOMNI.prepare(`
          INSERT INTO employee_account (
            id, employeeId, accountId, role, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          employeeAccountId,
          employeeId,
          accountId,
          "ADMIN",
          +new Date(),
          +new Date()
        ),
      ]);

      // Check if both operations succeeded
      if (!results[0].success || !results[1].success) {
        return Response.json(
          {
            success: false,
            error: "Failed to create account or associate employee with account",
          },
          {
            status: 500,
          }
        );
      }
    } catch (error: any) {
      // Batch operation failed - transaction is automatically rolled back
      return Response.json(
        {
          success: false,
          error: "Failed to create account: " + (error.message || "Unknown error"),
        },
        {
          status: 500,
        }
      );
    }

    // Fetch employee data for token generation
    const employeeResult = await c.env.DB_WOMNI.prepare(`
      SELECT 
        id, email, username, firstname, lastname, locale,
        emailPersonal, emailPersonalStatus, phonePrefix, phone,
        active, createdAt, updatedAt
      FROM employee 
      WHERE id = ?
    `).bind(employeeId).run();

    if (!employeeResult.results || employeeResult.results.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Employee not found",
        },
        {
          status: 404,
        }
      );
    }

    const employee = employeeResult.results[0];

    // Fetch all accounts associated with the employee (including the newly created one)
    const accountsResult = await c.env.DB_WOMNI.prepare(`
      SELECT 
        a.id, a.name, a.partner, a.account,
        ea.role, ea.createdAt as associationCreatedAt, ea.updatedAt as associationUpdatedAt
      FROM account a
      INNER JOIN employee_account ea ON a.id = ea.accountId
      WHERE ea.employeeId = ?
      ORDER BY a.name ASC
    `).bind(employeeId).run();

    const accounts = accountsResult.results || [];

    // Generate JWT token with updated accounts list
    let token;
    try {
      token = await generateToken(
        employee.id,
        {
          email: employee.email,
          locale: employee.locale,
          username: employee.username,
          firstname: employee.firstname,
        },
        accounts.map(account => ({
          id: account.id,
          partner: account.partner,
          account: account.account,
          role: account.role,
          name: account.name,
        })),
        c.env.JWT_SECRET_KEY,
        (60 * 60 * 24 * 365) // 1 year
      );
    } catch (error: any) {
      return Response.json(
        {
          success: false,
          error: "Failed to generate token: " + (error.message || "Unknown error"),
        },
        {
          status: 500,
        }
      );
    }

    // Call backend API to install the account
    try {
      const backendResponse = await fetch('https://backend.womni.store/api/v1/admin/accounts/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: accountId,
          account: accountSlug,
          partner: partner,
          name: name.trim(),
        }),
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend API error:', errorText);
        // Don't fail the account creation if backend call fails, just log it
        // The account was already created successfully
      }
    } catch (error: any) {
      console.error('Failed to call backend API:', error.message);
      // Don't fail the account creation if backend call fails, just log it
      // The account was already created successfully
    }

    // Return the created account
    return {
      success: true,
      token,
      user: {
        id: employee.id,
        email: employee.email,
        name: `${employee.firstname} ${employee.lastname}`,
        locale: employee.locale,
        username: employee.username,
        firstname: employee.firstname,
        lastname: employee.lastname,
        emailPersonal: employee.emailPersonal,
        emailPersonalStatus: employee.emailPersonalStatus,
        phonePrefix: employee.phonePrefix,
        phone: employee.phone,
        active: employee.active,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      },
      accounts: accounts.map(account => ({
        id: account.id,
        partner: account.partner,
        account: account.account,
        name: account.name,
      })),
    };
  }
}

