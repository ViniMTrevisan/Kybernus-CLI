import { z } from 'zod';

// Regex pattern: KYB-{PREFIX}-XXXX-XXXX-XXXX[-SIGNATURE]
// Matches: KYB-PRO-A1B2-C3D4-E5F6 (old) or KYB-PRO-A1B2-C3D4-E5F6-12345678 (new with signature)
const licenseKeyRegex = /^KYB-(PRO|TRIAL|FREE)-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}(-[A-F0-9]{8})?$/;

export const licenseValidateSchema = z.object({
    licenseKey: z.string().regex(licenseKeyRegex, 'Invalid license key format'),
    machineId: z.string().optional(),
});

export const licenseConsumeSchema = z.object({
    licenseKey: z.string().regex(licenseKeyRegex, 'Invalid license key format'),
});
