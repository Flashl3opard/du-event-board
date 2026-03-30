import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import addFormats from "ajv-formats";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

export const DEFAULTS = {
  event_type: "in-person",
  cost: "free",
  country: "Unknown",
  state_province: "Unspecified",
  hashtags: [],
  organization_logo: "",
  featured: false,
};

export function normalizeHashtag(value) {
  return String(value).trim().replace(/^#+/, "").toLowerCase();
}

export function normalizeEvent(event) {
  const locationText = String(event.location ?? "").toLowerCase();
  const inferredType =
    locationText === "online" || locationText.includes("virtual")
      ? "online"
      : DEFAULTS.event_type;

  const startDate = event.start_date ?? event.date ?? "";
  const endDate = event.end_date ?? startDate;

  const hashtags = (event.hashtags ?? event.tags ?? DEFAULTS.hashtags)
    .map(normalizeHashtag)
    .filter(Boolean);

  const stateOrProvince =
    event.state_province ?? event.region ?? DEFAULTS.state_province;

  return {
    ...event,
    event_type: event.event_type ?? inferredType,
    cost: event.cost ?? DEFAULTS.cost,
    start_date: startDate,
    end_date: endDate,
    country: event.country ?? (inferredType === "online" ? "Global" : DEFAULTS.country),
    state_province: stateOrProvince,
    hashtags,
    organization_logo: event.organization_logo ?? DEFAULTS.organization_logo,
    featured: Boolean(event.featured),

    // Legacy aliases for compatibility with existing code paths.
    date: event.date ?? startDate,
    region: event.region ?? stateOrProvince,
    tags: event.tags ?? hashtags,
  };
}

export function readYamlDocument(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return YAML.parse(raw);
}

export function loadSchema(schemaPath = path.join(projectRoot, "data", "event-schema.json")) {
  const raw = fs.readFileSync(schemaPath, "utf8");
  return JSON.parse(raw);
}

export function validateEventsDocument(document, schema) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const normalized = {
    ...document,
    events: (document.events ?? []).map(normalizeEvent),
  };

  const schemaValid = validate(normalized);
  const errors = [];

  if (!schemaValid && validate.errors) {
    for (const error of validate.errors) {
      errors.push(`${error.instancePath || "/"} ${error.message}`.trim());
    }
  }

  normalized.events.forEach((event, index) => {
    if (!event.start_date || !event.end_date) {
      errors.push(`events/${index}: start_date and end_date are required`);
    }

    if (event.start_date && event.end_date && event.end_date < event.start_date) {
      errors.push(
        `events/${index}: end_date (${event.end_date}) must be on or after start_date (${event.start_date})`,
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    normalized,
  };
}
