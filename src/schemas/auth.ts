import z from "zod";

const emailSchema = z.email();
const passwordSchema = z.string().min(8);

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const signupSchema = z.object({
    fullName: z.string().min(5),
    email: emailSchema,
    password: passwordSchema,
});
