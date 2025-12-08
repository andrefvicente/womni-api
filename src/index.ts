import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AuthLogin } from "./endpoints/admin/auth/login";
import { EmployeeCreate } from "./endpoints/admin/employee/create";
import { EmployeeAccounts } from "./endpoints/admin/employee/accounts/list";
import { EmployeeAccountCreate } from "./endpoints/admin/employee/accounts/create";
import { EmployeeAccountUpdate } from "./endpoints/admin/employee/accounts/update";
import { EmployeeAccountGet } from "./endpoints/admin/employee/accounts/get";
import { ListAccountEmployees } from "./endpoints/admin/account/employees/list";
// Start a Hono app
const app = new Hono();

// Add CORS middleware
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:4200",
      "http://localhost:8100",
      "capacitor://localhost",
      "https://pos.womni.store",
      "https://app.womni.store",
      "https://backoffice.womni.store",
      "https://wbackoffice.pages.dev"
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-womni-tenant",
      "x-womni-accountId",
      "access-control-allow-methods",
      "access-control-allow-origin",
      "access-control-allow-headers"
    ],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  }),
);

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
// @ts-ignore - chanfana handles OpenAPIRoute class registration internally
openapi.post("/v2/auth/login", AuthLogin);
// @ts-ignore
openapi.post("/v2/employee", EmployeeCreate);
// @ts-ignore
openapi.get("/v2/employee/:employeeId/accounts", EmployeeAccounts);
// @ts-ignore
openapi.post("/v2/employee/:employeeId/accounts", EmployeeAccountCreate);
// @ts-ignore
openapi.put("/v2/employee/:employeeId/accounts/:accountId", EmployeeAccountUpdate);
// @ts-ignore
openapi.get("/v2/employee/:employeeId/accounts/:accountId", EmployeeAccountGet);
// @ts-ignore
openapi.get("/v2/accounts/:accountId/employees", ListAccountEmployees);


// Export the Hono app
export default app;
