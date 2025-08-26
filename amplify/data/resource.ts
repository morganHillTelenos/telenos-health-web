// amplify/data/resource.ts - Minimal Note addition
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Doctor: a
    .model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      email: a.email().required(),
      specialty: a.string().required(),
      experience: a.string(),
      phone: a.string(),
      bio: a.string(),
      isActive: a.boolean().default(true),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Patient: a
    .model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      email: a.email().required(),
      dateOfBirth: a.date().required(),
      phone: a.string(),
      isActive: a.boolean().default(true),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Note: a
    .model({
      title: a.string().required(),
      content: a.string().required(),
      category: a.string(),
      priority: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
// Force update
