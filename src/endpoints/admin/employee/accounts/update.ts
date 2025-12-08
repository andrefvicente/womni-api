import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";

export class EmployeeAccountUpdate extends OpenAPIRoute {
  schema = {
    tags: ["Employee"],
    summary: "Update an employee's role in an account",
    request: {
      params: z.object({
        employeeId: Str({ description: "Employee ID" }),
        accountId: Str({ description: "Account ID" }),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              role: Str({ description: "New role for the employee in the account" }),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the updated employee-account association",
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

    // Retrieve the employee ID and account ID from params, and role from body
    const { employeeId, accountId } = data.params;
    const { role } = data.body;

    // Get current timestamp
    const now = new Date().toISOString();

    // Update the association
    const result = await c.env.DB_WOMNI.prepare(`
      UPDATE employee_account 
      SET role = ?, updatedAt = ?
      WHERE employeeId = ? AND accountId = ?
      RETURNING id, employeeId, accountId, role, createdAt, updatedAt
    `).bind(
      role,
      now,
      employeeId,
      accountId
    ).run();

    if (!result.success || !result.results || result.results.length === 0) {
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

    // Return the updated association
    return {
      success: true,
      result: {
        employeeAccount: result.results[0],
      },
    };
  }
} 