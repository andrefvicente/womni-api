import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";

export class EmployeeSearch extends OpenAPIRoute {
  schema = {
    tags: ["Employee"],
    summary: "Search employees by email or phone number",
    request: {
      query: z.object({
        email: Str({ description: "Email to search for", optional: true }),
        phone: Str({ description: "Phone number to search for (without prefix)", optional: true }),
        phonePrefix: Str({ description: "Phone prefix to search for", optional: true }),
      }),
    },
    responses: {
      "200": {
        description: "Returns list of matching employees",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                users: z.array(z.object({
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
                })),
              }),
            }),
          },
        },
      },
      "400": {
        description: "Bad request - missing required search parameters",
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

    // Retrieve query parameters
    const { email, phone, phonePrefix } = data.query;

    // Validate that at least one search parameter is provided
    if (!email && !phone) {
      return Response.json(
        {
          success: false,
          error: "At least one of 'email' or 'phone' must be provided",
        },
        {
          status: 400,
        }
      );
    }

    // Build the query dynamically based on provided parameters
    let query = `
      SELECT 
        id, email, username, firstname, lastname, locale,
        emailPersonal, emailPersonalStatus, phonePrefix, phone,
        active, createdAt, updatedAt
      FROM employee 
      WHERE 1=1
    `;
    const bindings: any[] = [];

    if (email) {
      query += ` AND email LIKE ?`;
      bindings.push(`%${email}%`);
    }

    if (phone) {
      if (phonePrefix) {
        query += ` AND phonePrefix = ? AND phone LIKE ?`;
        bindings.push(phonePrefix);
        bindings.push(`%${phone}%`);
      } else {
        query += ` AND phone LIKE ?`;
        bindings.push(`%${phone}%`);
      }
    }

    query += ` ORDER BY firstname ASC, lastname ASC LIMIT 50`;

    // Execute the query
    const usersResult = await c.env.DB_WOMNI.prepare(query).bind(...bindings).run();

    if (!usersResult.results || usersResult.results.length === 0) {
      return {
        success: true,
        result: {
          users: [],
        },
      };
    }

    // Map results to response format
    const users = usersResult.results.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: `${user.firstname} ${user.lastname}`,
      locale: user.locale,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      emailPersonal: user.emailPersonal || "",
      emailPersonalStatus: user.emailPersonalStatus || "",
      phonePrefix: user.phonePrefix || "",
      phone: user.phone || "",
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    // Return success response with user data
    return {
      success: true,
      result: {
        users,
      },
    };
  }
}
