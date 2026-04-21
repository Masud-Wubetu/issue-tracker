import { z } from "zod";

export const createIssueSchema = z.object({
    title: z.string().min(1, 'Title is required.').max(255),
    description: z.string().min(1, 'Description is required.'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    type: z.enum(['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT']).optional(),
});

export const patchIssueSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(255)
    .optional(),
  description: z
    .string()
    .min(1, "Description is required.")
    .max(65535)
    .optional(),
  assigneeId: z
    .string()
    .min(1, "AssigneeId is required.")
    .max(255)
    .optional()
    .nullable(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  type: z.enum(['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT']).optional(),
});

