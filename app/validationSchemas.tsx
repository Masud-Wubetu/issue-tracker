import { z } from "zod";

export const createIssueSchema = z.object({
    title: z.string().min(1, 'Title is required.').max(255),
    description: z.string().min(1, 'Description is required.'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    type: z.enum(['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT']),
    projectId: z.number({ message: 'Project is required.' }),
    assigneeId: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
});

export const patchIssueSchema = z.object({
  title: z.string().min(1, "Title is required.").max(255).optional(),
  description: z.string().min(1, "Description is required.").optional(),
  assigneeId: z.string().optional().nullable(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  type: z.enum(['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT']).optional(),
  projectId: z.number().optional(),
  dueDate: z.string().optional().nullable(),
});
