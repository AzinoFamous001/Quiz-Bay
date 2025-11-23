import type { DataType, ValidationErrors } from "../lib/type";

// In ../hooks/ValidateSignup.ts
export const validateSignup = (data: DataType): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Name validation (trim for whitespace)
  const trimmedName = data.name?.trim() || "";
  if (!trimmedName || trimmedName.length < 2) {
    errors.name =
      "Full name is required and must be at least 2 characters long.";
  }

  // Email (trim)
  const trimmedEmail = data.email?.trim() || "";
  if (!trimmedEmail) {
    errors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
    errors.email = "Email must be a valid address.";
  }

  // Password
  if (!data.password || data.password.length < 6) {
    errors.password =
      "Password is required and must be at least 6 characters long.";
  }

  // Confirm Password (trim for comparison)
  const trimmedConfirm = data.confirmPassword?.trim() || "";
  if (!trimmedConfirm) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (trimmedConfirm !== data.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};
