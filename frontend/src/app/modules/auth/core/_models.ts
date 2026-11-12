import { Dispatch, SetStateAction } from "react";
import * as Yup from "yup";

export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const AUTH_MESSAGES = {
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Enter a valid email address",
  EMAIL_TOO_LONG: `Email can have at most ${EMAIL_MAX_LENGTH} characters`,
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_TOO_SHORT: `Password needs at least ${PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_TOO_LONG: `Password can have at most ${PASSWORD_MAX_LENGTH} characters`,
  CONFIRM_PASSWORD_REQUIRED: "Type the password again",
  PASSWORDS_DO_NOT_MATCH: "The two passwords do not match",
  SIGN_UP_SUCCESS: "Account created. Please sign in.",
} as const;

export const AUTH_LABELS = {
  LOGIN_TITLE: "Sign in",
  REGISTER_TITLE: "Create your account",
  TAGLINE: "Know when your website goes down.",
  EMAIL: "Email",
  PASSWORD: "Password",
  CONFIRM_PASSWORD: "Confirm password",
  SIGN_IN: "Sign in",
  SIGN_UP: "Sign up",
  PLEASE_WAIT: "Please wait...",
  NO_ACCOUNT: "No account yet?",
  HAVE_ACCOUNT: "Already have an account?",
} as const;

export interface IUserModel {
  id: string;
  email: string;
  status_page_slug: string;
  created_at: string;
}

export interface ISignInData {
  access_token: string;
}

export interface IEmail {
  email: string;
}

export interface ILoginValues {
  email: string;
  password: string;
}

export interface IRegistrationValues extends ILoginValues {
  confirmPassword: string;
}

export type AuthContextProps = {
  auth: string | undefined;
  saveAuth: (auth: string | undefined) => void;
  currentUser: IUserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<IUserModel | undefined>>;
  logout: () => Promise<void>;
};

export const loginInitialValues: ILoginValues = {
  email: "",
  password: "",
};

export const registrationInitialValues: IRegistrationValues = {
  email: "",
  password: "",
  confirmPassword: "",
};

const emailRule = Yup.string()
  .trim()
  .email(AUTH_MESSAGES.EMAIL_INVALID)
  .max(EMAIL_MAX_LENGTH, AUTH_MESSAGES.EMAIL_TOO_LONG)
  .required(AUTH_MESSAGES.EMAIL_REQUIRED);

export const loginSchema = Yup.object({
  email: emailRule,
  password: Yup.string().required(AUTH_MESSAGES.PASSWORD_REQUIRED),
});

export const registrationSchema = Yup.object({
  email: emailRule,
  password: Yup.string()
    .min(PASSWORD_MIN_LENGTH, AUTH_MESSAGES.PASSWORD_TOO_SHORT)
    .max(PASSWORD_MAX_LENGTH, AUTH_MESSAGES.PASSWORD_TOO_LONG)
    .required(AUTH_MESSAGES.PASSWORD_REQUIRED),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH)
    .required(AUTH_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
});
