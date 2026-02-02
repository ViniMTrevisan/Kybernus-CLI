/**
 * Device Flow OAuth service for CLI authentication
 * Handles the device authorization flow for Google OAuth
 */

const API_URL = process.env.KYBERNUS_API_URL || 'https://kybernus-cli.vercel.app/api';

interface DeviceCodeResponse {
    deviceCode: string;
    userCode: string;
    verificationUrl: string;
    expiresIn: number;
    interval: number;
}

interface PollResponse {
    status: 'pending' | 'complete';
    email?: string;
    licenseKey?: string;
    tier?: string;
    error?: string;
}

/**
 * Request a device code for OAuth flow
 */
export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
    const response = await fetch(`${API_URL}/auth/device/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Failed to get device code');
    }

    return response.json() as Promise<DeviceCodeResponse>;
}

/**
 * Poll for device authorization completion
 */
export async function pollDeviceAuth(deviceCode: string): Promise<PollResponse> {
    const response = await fetch(`${API_URL}/auth/device/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceCode }),
    });

    if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Polling failed');
    }

    return response.json() as Promise<PollResponse>;
}

/**
 * Wait for user to complete OAuth with polling
 * @param deviceCode - The device code to poll
 * @param interval - Polling interval in seconds
 * @param maxAttempts - Maximum number of polling attempts
 */
export async function waitForAuth(
    deviceCode: string,
    interval: number = 5,
    maxAttempts: number = 120 // 10 minutes max
): Promise<PollResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
        await sleep(interval * 1000);
        attempts++;

        try {
            const result = await pollDeviceAuth(deviceCode);

            if (result.status === 'complete') {
                return result;
            }

            // Still pending, continue polling
        } catch (error: any) {
            // Check for specific errors
            if (error.message?.includes('expired')) {
                throw new Error('Device code expired. Please try again.');
            }
            if (error.message?.includes('slow_down')) {
                // Increase interval if rate limited
                interval = Math.min(interval + 1, 10);
            }
            // Continue polling for other transient errors
        }
    }

    throw new Error('Authentication timed out. Please try again.');
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
