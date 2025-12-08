import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";

export class ListAccountEmployees extends OpenAPIRoute {
  schema = {
    tags: ["Account"],
    summary: "List all employees associated with an account",
    request: {
      params: z.object({
        accountId: Str({ description: "Account ID" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns the list of employees associated with the account",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                employees: z.array(z.object({
                  id: Str(),
                  locale: Str(),
                  firstname: Str(),
                  lastname: Str(),
                  email: Str(),
                  phonePrefix: Str(),
                  phone: Str(),
                  active: Bool(),
                  role: Str(),
                  createdAt: Str(),
                  updatedAt: Str(),
                })),
              }),
            }),
          },
        },
      },
      "404": {
        description: "Account not found",
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

    // Retrieve the account ID from params
    const { accountId } = data.params;

    // First check if account exists
    const accountCheck = await c.env.DB_WOMNI.prepare(`
      SELECT id FROM account WHERE id = ?
    `).bind(accountId).run();

    if (!accountCheck.results || accountCheck.results.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Account not found",
        },
        {
          status: 404,
        }
      );
    }

    // Query the database for employees associated with the account
    const employeesResult = await c.env.DB_WOMNI.prepare(`
      SELECT 
        e.id, e.locale, e.firstname, e.lastname, e.email,e.username
        e.phonePrefix, e.phone, e.active,
        ea.role, ea.createdAt, ea.updatedAt
      FROM employee e
      INNER JOIN employee_account ea ON e.id = ea.employeeId
      WHERE ea.accountId = ?
      ORDER BY e.firstname ASC, e.lastname ASC
    `).bind(accountId).run();

    if (!employeesResult.results) {
      return {
        success: true,
        result: {
          employees: [],
        },
      };
    }

    // Return the list of employees
    return {
      success: true,
      result: {
        employees: employeesResult.results,
      },
    };
  }
}

