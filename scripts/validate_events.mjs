#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  loadSchema,
  readYamlDocument,
  validateEventsDocument,
} from "./eventValidationCore.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function main() {
  const eventsPath = path.join(projectRoot, "data", "events.yaml");
  const schemaPath = path.join(projectRoot, "data", "event-schema.json");

  const document = readYamlDocument(eventsPath);
  const schema = loadSchema(schemaPath);

  const result = validateEventsDocument(document, schema);

  if (!result.isValid) {
    console.error("Event validation failed. Please fix the following issues:");
    result.errors.forEach((error) => {
      console.error(`- ${error}`);
    });
    process.exit(1);
  }

  console.log(`Validated ${result.normalized.events.length} events successfully.`);
}

main();
