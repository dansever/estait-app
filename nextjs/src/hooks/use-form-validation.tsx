/**
 * File: use-form-validation.tsx
 *
 * Responsibility:
 * Provides form validation functionality with real estate-specific validation rules
 *
 * Key features:
 * - Offers common validation rules for real estate data
 * - Supports custom validation rules
 * - Manages form errors and validation state
 * - Provides real-time validation as user types
 *
 * Components:
 * - useFormValidation: Hook that provides form validation functionality
 */

import { useState, useEffect, useCallback } from "react";

// Define validation rule types
type ValidationRule = {
  validate: (value: any, formValues?: Record<string, any>) => boolean;
  message: string;
};

// Define validation rules object structure
interface ValidationRules {
  [field: string]: ValidationRule[];
}

// Return type for the hook
interface UseFormValidationReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, isTouched: boolean) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
}

// Common validation rules specific to real estate applications
export const validationRules = {
  required: (message = "This field is required"): ValidationRule => ({
    validate: (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim() !== "";
      if (typeof value === "number") return true;
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    },
    message,
  }),

  email: (message = "Please enter a valid email address"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Skip if empty (use required rule if needed)
      return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
    },
    message,
  }),

  phone: (message = "Please enter a valid phone number"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Skip if empty
      return /^(\+\d{1,3}[- ]?)?\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(
        value
      );
    },
    message,
  }),

  zipCode: (message = "Please enter a valid ZIP code"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Skip if empty
      return /^\d{5}(-\d{4})?$/.test(value);
    },
    message,
  }),

  currency: (
    message = "Please enter a valid currency amount"
  ): ValidationRule => ({
    validate: (value) => {
      if (!value && value !== 0) return true; // Skip if empty
      return /^-?\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.[0-9][0-9])?$/.test(
        String(value)
      );
    },
    message,
  }),

  numeric: (message = "Please enter a valid number"): ValidationRule => ({
    validate: (value) => {
      if (!value && value !== 0) return true; // Skip if empty
      return !isNaN(Number(value));
    },
    message,
  }),

  minValue: (
    min: number,
    message = `Value must be at least ${min}`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value && value !== 0) return true; // Skip if empty
      return Number(value) >= min;
    },
    message,
  }),

  maxValue: (
    max: number,
    message = `Value must be at most ${max}`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value && value !== 0) return true; // Skip if empty
      return Number(value) <= max;
    },
    message,
  }),

  minLength: (
    min: number,
    message = `Must be at least ${min} characters`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Skip if empty
      return String(value).length >= min;
    },
    message,
  }),

  maxLength: (
    max: number,
    message = `Must be at most ${max} characters`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Skip if empty
      return String(value).length <= max;
    },
    message,
  }),

  match: (
    matchField: string,
    message = "Fields do not match"
  ): ValidationRule => ({
    validate: (value, formValues) => {
      if (!formValues) return true;
      return value === formValues[matchField];
    },
    message,
  }),

  futureDate: (message = "Date must be in the future"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Skip if empty
      const date = new Date(value);
      return date > new Date();
    },
    message,
  }),

  pastDate: (message = "Date must be in the past"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Skip if empty
      const date = new Date(value);
      return date < new Date();
    },
    message,
  }),

  validDate: (message = "Please enter a valid date"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Skip if empty
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    message,
  }),
};

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>(
    {} as Record<keyof T, string>
  );
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T): boolean => {
      if (!validationRules[field as string]) return true;

      let isFieldValid = true;
      let errorMessage = "";

      // Apply each validation rule for the field
      for (const rule of validationRules[field as string]) {
        const isValid = rule.validate(values[field], values);

        if (!isValid) {
          isFieldValid = false;
          errorMessage = rule.message;
          break;
        }
      }

      // Update error state for this field
      setErrors((prev) => ({ ...prev, [field]: errorMessage }));

      return isFieldValid;
    },
    [values, validationRules]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    let formIsValid = true;
    const updatedErrors: Record<string, string> = {};

    // Validate each field with rules
    Object.keys(validationRules).forEach((field) => {
      if (!validationRules[field]) return;

      let fieldIsValid = true;
      let fieldErrorMessage = "";

      // Apply each validation rule for the field
      for (const rule of validationRules[field]) {
        const isValid = rule.validate(values[field as keyof T], values);

        if (!isValid) {
          fieldIsValid = false;
          fieldErrorMessage = rule.message;
          break;
        }
      }

      if (!fieldIsValid) {
        formIsValid = false;
        updatedErrors[field] = fieldErrorMessage;
      }
    });

    setErrors(updatedErrors as Record<keyof T, string>);
    setIsValid(formIsValid);

    return formIsValid;
  }, [values, validationRules]);

  // Handle field change
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;

      // Handle different input types
      const finalValue =
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseFloat(value)
          : value;

      setValues((prev) => ({ ...prev, [name]: finalValue }));
      setIsDirty(true);
    },
    []
  );

  // Handle field blur
  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name as keyof T);
    },
    [validateField]
  );

  // Set a field value programmatically
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  // Set a field touched state
  const setFieldTouched = useCallback(
    (field: keyof T, isTouched: boolean) => {
      setTouched((prev) => ({ ...prev, [field]: isTouched }));
      if (isTouched) {
        validateField(field);
      }
    },
    [validateField]
  );

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
    setIsDirty(false);
    setIsValid(false);
  }, [initialValues]);

  useEffect(() => {
    if (!isDirty) return;

    const timeout = setTimeout(() => {
      validateForm();
    }, 200); // Debounce for 200ms

    return () => clearTimeout(timeout);
  }, [values, isDirty, validateForm]);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
  };
}
