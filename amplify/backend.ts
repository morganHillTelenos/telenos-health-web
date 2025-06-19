import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
// import { data } from './data/resource';  // Comment this out
import { storage } from "./storage/resource";

export const backend = defineBackend({
  auth,
  // data,  // Comment this out
  storage,
});
