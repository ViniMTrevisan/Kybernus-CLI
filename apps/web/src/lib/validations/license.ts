import { z } from 'zod';

export const licenseValidateSchema = z.object({
    licenseKey: z.string().min(10, 'Invalid license key format'), // Basic length check
    machineId: z.string().optional(),
});

export const licenseConsumeSchema = z.object({
    licenseKey: z.string().min(10, 'Invalid license key format'),
});
