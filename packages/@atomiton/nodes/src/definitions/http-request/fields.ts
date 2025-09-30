/**
 * HTTP Request Field Configuration
 * UI field configurations for HTTP request parameters
 * MVP: Core HTTP request fields only
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { httpRequestSchema } from "#schemas/http-request";

/**
 * Field configuration for HTTP request parameters
 *
 * Auto-derived from httpRequestSchema with selective overrides for:
 * - method: enum with descriptive labels
 * - headers: textarea with custom placeholder and rows
 * - body: textarea with custom placeholder and rows
 */
export const httpRequestFields = createFieldsFromSchema(httpRequestSchema, {
  method: {
    options: [
      { value: "GET", label: "GET" },
      { value: "POST", label: "POST" },
      { value: "PUT", label: "PUT" },
      { value: "DELETE", label: "DELETE" },
    ],
  },
  headers: {
    controlType: "textarea",
    placeholder:
      '{"Content-Type": "application/json", "Authorization": "Bearer token"}',
    rows: 3,
  },
  body: {
    controlType: "textarea",
    placeholder: '{"key": "value"}',
    rows: 5,
  },
});
