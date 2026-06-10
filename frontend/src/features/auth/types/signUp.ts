import { SignInPayload } from "./singIn";

export type SignUpPayload = SignInPayload & {
  name: string;
};