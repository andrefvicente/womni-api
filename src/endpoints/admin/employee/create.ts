import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { hashPassword } from "../../../helpers/auth";
import { getTranslation } from "../../../helpers/translations";
import { ulid } from 'ulid';

export class EmployeeCreate extends OpenAPIRoute {
  schema = {
    tags: ["Employee"],
    summary: "Create a new employee",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              locale: Str({ description: "Locale" }),
              firstname: Str({ description: "First name" }),
              lastname: Str({ description: "Last name" }),
              email: Str({ description: "Email" }),
              phonePrefix: Str({ description: "Phone prefix" }),
              phone: Str({ description: "Phone number" }),
              password: Str({ description: "Password" }),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created employee",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                employee: z.object({
                  id: Str(),
                  locale: Str(),
                  firstname: Str(),
                  lastname: Str(),
                  email: Str(),
                  emailPersonalStatus: Str(),
                  phonePrefix: Str(),
                  phone: Str(),
                  active: Bool(),
                  createdAt: Str(),
                  updatedAt: Str(),
                }),
              }),
            }),
          },
        },
      },
      "409": {
        description: "Conflict - Resource already exists",
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

    // Generate a UUID for the employee
    const employeeId = ulid();

    // Retrieve the validated request body
    const {
      locale,
      firstname,
      lastname,
      email,
      phonePrefix,
      phone,
      password,
    } = data.body;

    // Check if email already exists
    const emailCheck = await c.env.DB_WOMNI.prepare(`
      SELECT id FROM employee WHERE email = ?
    `).bind(email).run();

    if (emailCheck.results && emailCheck.results.length > 0) {
      return Response.json(
        {
          success: false,
          error: getTranslation('email_exists', locale),
        },
        {
          status: 409,
        }
      );
    }


    // Check if phone number combination already exists
    const phoneCheck = await c.env.DB_WOMNI.prepare(`
      SELECT id FROM employee WHERE phonePrefix = ? AND phone = ?
    `).bind(phonePrefix, phone).run();

    if (phoneCheck.results && phoneCheck.results.length > 0) {
      return Response.json(
        {
          success: false,
          error: getTranslation('phone_exists', locale),
        },
        {
          status: 409,
        }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Get current timestamp
    const now = new Date().toISOString();

    // Insert into database
    const result = await c.env.DB_WOMNI.prepare(`
      INSERT INTO employee (
        id, locale, firstname, lastname, email,
        emailPersonalStatus, phonePrefix, phone,
        passwd, active,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      employeeId,
      locale,
      firstname,
      lastname,
      email,
      'pending', // emailPersonalStatus
      phonePrefix,
      phone,
      hashedPassword,
      1, // active
      now,
      now
    ).run();

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: getTranslation('create_failed', locale),
        },
        {
          status: 500,
        }
      );
    }

    // Return the created employee
    return {
      success: true,
      result: {
        employee: {
          id: employeeId,
          locale,
          firstname,
          lastname,
          email,
          emailPersonalStatus: 'pending',
          phonePrefix,
          phone,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
      },
    };
  }
} 