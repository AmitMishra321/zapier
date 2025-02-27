import { z } from "zod";

export const SignUpSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3),
  password: z.string().min(6),
});

export const SignInSchea = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const ZapCreateSchema = z.object({
  availableTriggerId: z.string(),
  triggerMetaData: z.any().optional(),
  actions: z.array(
    z.object({
      availableActionId: z.string(),
      actionMetaData: z.any().optional(),
    })
  ),
});
