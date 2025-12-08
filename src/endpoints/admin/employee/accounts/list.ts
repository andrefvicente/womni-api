import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";

export class EmployeeAccounts extends OpenAPIRoute {
  schema = {
    tags: ["Employee"],
    summary: "List all accounts associated with an employee",
    request: {
      params: z.object({
        employeeId: Str({ description: "Employee ID" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns the list of accounts associated with the employee",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                accounts: z.array(z.object({
                  id: Str(),
                  name: Str(),
                  tenant: Str(),
                  region: Str(),
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
        description: "Employee not found",
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

    // Retrieve the employee ID from params
    const { employeeId } = data.params;

    // First check if employee exists
    const employeeCheck = await c.env.DB_WOMNI.prepare(`
      SELECT id FROM employee WHERE id = ?
    `).bind(employeeId).run();

    if (!employeeCheck.results || employeeCheck.results.length === 0) {
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

    // Query the database for accounts associated with the employee
    const accountsResult = await c.env.DB_WOMNI.prepare(`
      SELECT 
        a.id, a.name, a.tenant, a.region,
        ea.role, ea.createdAt, ea.updatedAt
      FROM account a
      INNER JOIN employee_account ea ON a.id = ea.accountId
      WHERE ea.employeeId = ?
      ORDER BY a.name ASC
    `).bind(employeeId).run();

    if (!accountsResult.results) {
      return {
        success: true,
        result: {
          accounts: [],
        },
      };
    }

    // Return the list of accounts
    return {
      success: true,
      result: {
        accounts: accountsResult.results,
      },
    };
  }
} 