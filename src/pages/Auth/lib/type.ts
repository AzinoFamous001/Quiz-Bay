interface DataType {
  id?: string;
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export type { DataType, ValidationErrors };
