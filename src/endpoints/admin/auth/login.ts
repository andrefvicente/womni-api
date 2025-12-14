import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { verifyPassword, generateToken } from "../../../helpers/auth";

export class AuthLogin extends OpenAPIRoute {
  schema = {
    tags: ["Authentication"],
    summary: "Login user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: Str({ description: "User email" }),
              password: Str({ description: "User password" }),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns authentication token and user info",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                token: Str(),
                user: z.object({
                  id: Str(),
                  email: Str(),
                  name: Str(),
                  locale: Str(),
                  username: Str(),
                  firstname: Str(),
                  lastname: Str(),
                  emailPersonal: Str(),
                  emailPersonalStatus: Str(),
                  phonePrefix: Str(),
                  phone: Str(),
                  active: Bool(),
                  createdAt: Str(),
                  updatedAt: Str(),
                }),
                accounts: z.array(z.object({
                  id: Str(),
                  name: Str(),
                  tenant: Str(),
                  region: Str(),
                  role: Str(),
                  associationCreatedAt: Str(),
                  associationUpdatedAt: Str(),
                })),
              }),
            }),
          },
        },
      },
      "401": {
        description: "Invalid credentials",
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

    // Retrieve the validated request body
    const { email, password } = data.body;

    // Query the database for the user
    const userResult = await c.env.DB_WOMNI.prepare(`
      SELECT 
        id, email, username, firstname, lastname, locale,
        emailPersonal, emailPersonalStatus, phonePrefix, phone,
        passwd, active, createdAt, updatedAt
      FROM employee 
      WHERE email = ? AND active = 1
    `).bind(email).run();

    if (!userResult.results || userResult.results.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    const user = userResult.results[0];

    // Verify the password
    const isValidPassword = await verifyPassword(user.passwd, password);
    if (!isValidPassword) {
      return Response.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    // Fetch all accounts associated with the user
    const accountsResult = await c.env.DB_WOMNI.prepare(`
      SELECT 
        a.id, a.name, a.partner, a.account,
        ea.role, ea.createdAt as associationCreatedAt, ea.updatedAt as associationUpdatedAt
      FROM account a
      INNER JOIN employee_account ea ON a.id = ea.accountId
      WHERE ea.employeeId = ?
      ORDER BY a.name ASC
    `).bind(user.id).run();

    const accounts = accountsResult.results || [];

    // Generate JWT token
    const token = await generateToken(
      user.id,
      {
        email: user.email,
        locale: user.locale,
        username: user.username,
        firstname: user.firstname,
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

    // Return success response with user data and token
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstname} ${user.lastname}`,
        locale: user.locale,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        emailPersonal: user.emailPersonal,
        emailPersonalStatus: user.emailPersonalStatus,
        phonePrefix: user.phonePrefix,
        phone: user.phone,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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