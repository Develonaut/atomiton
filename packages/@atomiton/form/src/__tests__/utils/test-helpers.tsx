import { vi } from "vitest";
import { z } from "zod";
import { zodValidator } from "../../utils/zod.js";

export const createMockSubmit = () => vi.fn().mockResolvedValue(undefined);

const userRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  age: z.number().min(18, "You must be at least 18 years old"),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
});

export const userRegistrationValidators = {
  firstName: [zodValidator(userRegistrationSchema.shape.firstName)],
  lastName: [zodValidator(userRegistrationSchema.shape.lastName)],
  email: [zodValidator(userRegistrationSchema.shape.email)],
  age: [zodValidator(userRegistrationSchema.shape.age)],
  terms: [zodValidator(userRegistrationSchema.shape.terms)],
};

export const defaultUserValues = {
  firstName: "",
  lastName: "",
  email: "",
  age: 0,
  terms: false,
};

// export const renderWithUser = (component: React.ReactElement) => {
//   const user = userEvent.setup();
//   const utils = render(component);
//   return { user, ...utils };
// };
