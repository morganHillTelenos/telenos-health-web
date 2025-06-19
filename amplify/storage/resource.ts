import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "healthcareStorage",
  access: (allow) => ({
    "patient-documents/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
    "medical-records/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
  }),
});
