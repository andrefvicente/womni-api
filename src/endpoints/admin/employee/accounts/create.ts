import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";

export class EmployeeAccountCreate extends OpenAPIRoute {
  schema = {
    tags: ["Employee"],
    summary: "Associate an employee with an account",
    request: {
      params: z.object({
        employeeId: Str({ description: "Employee ID" }),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              accountId: Str({ description: "Account ID" }),
              role: Str({ description: "Employee role in the account" }),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created employee-account association",
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
        description: "Employee or account not found",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: Str(),
            }),
          },
        },
      },
      "409": {
        description: "Employee already associated with this account",
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

    // Retrieve the employee ID from params and account data from body
    const { employeeId } = data.params;
    const { accountId, role } = data.body;

    // Check if employee exists
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

    // Check if account exists
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

    // Check if association already exists
    const existingCheck = await c.env.DB_WOMNI.prepare(`
      SELECT id FROM employee_account WHERE employeeId = ? AND accountId = ?
    `).bind(employeeId, accountId).run();

    if (existingCheck.results && existingCheck.results.length > 0) {
      return Response.json(
        {
          success: false,
          error: "Employee already associated with this account",
        },
        {
          status: 409,
        }
      );
    }

    // Get current timestamp
    const now = new Date().toISOString();

    // Create the association
    const result = await c.env.DB_WOMNI.prepare(`
      INSERT INTO employee_account (
        employeeId, accountId, role, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      employeeId,
      accountId,
      role,
      now,
      now
    ).run();

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: "Failed to create employee-account association",
        },
        {
          status: 500,
        }
      );
    }

    // Return the created association
    return {
      success: true,
      result: {
        employeeAccount: {
          id: result.meta.last_row_id,
          employeeId,
          accountId,
          role,
          createdAt: now,
          updatedAt: now,
        },
      },
    };
  }
} 