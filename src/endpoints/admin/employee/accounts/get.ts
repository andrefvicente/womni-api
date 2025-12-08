import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";

export class EmployeeAccountGet extends OpenAPIRoute {
  schema = {
    tags: ["Employee"],
    summary: "Get a specific employee-account association",
    request: {
      params: z.object({
        employeeId: Str({ description: "Employee ID" }),
        accountId: Str({ description: "Account ID" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns the employee-account association",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                employeeAccount: z.object({
                  id: Str(),
                  employeeId: Str(),
                  accountId: Str(),
                  role: Str(),
                  createdAt: Str(),
                  updatedAt: Str(),
                }),
              }),
            }),
          },
        },
      },
      "404": {
        description: "Employee-account association not found",
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

    // Retrieve the employee ID and account ID from params
    const { employeeId, accountId } = data.params;

    // Query the database for the specific association
    const result = await c.env.DB_WOMNI.prepare(`
      SELECT 
        ea.id, ea.employeeId, ea.accountId, ea.role,
        ea.createdAt, ea.updatedAt,
        a.name as accountName, a.tenant, a.region,
        e.firstname, e.lastname, e.email
      FROM employee_account ea
      INNER JOIN account a ON ea.accountId = a.id
      INNER JOIN employee e ON ea.employeeId = e.id
      WHERE ea.employeeId = ? AND ea.accountId = ?
    `).bind(employeeId, accountId).run();

    if (!result.results || result.results.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Employee-account association not found",
        },
        {
          status: 404,
        }
      );
    }

    // Return the association with additional account and employee details
    return {
      success: true,
      result: {
        employeeAccount: result.results[0],
      },
    };
  }
} 