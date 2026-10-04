/** Health endpoint response, including database connectivity status. */
export interface HealthResponse {
  status: "ok";
  database: "connected" | "not_configured";
}
