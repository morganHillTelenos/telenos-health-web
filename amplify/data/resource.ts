import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Patient: a
    .model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      email: a.email().required(),
      dateOfBirth: a.date().required(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});