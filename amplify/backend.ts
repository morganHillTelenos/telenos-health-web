// amplify/backend.ts - Clean version
import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";

// Only define data for now, no auth conflicts
export const backend = defineBackend({
  data,
});
