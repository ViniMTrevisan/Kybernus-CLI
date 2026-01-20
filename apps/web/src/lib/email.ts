import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'Kybernus <noreply@kybernus.com>';

// Lazy initialization to avoid errors when API key is not set
let resend: Resend | null = null;

function getResend(): Resend | null {
    if (!resendApiKey) {
        console.warn('[Email] RESEND_API_KEY not configured, emails will be skipped');
        return null;
    }
    if (!resend) {
        resend = new Resend(resendApiKey);
    }
    return resend;
}

export const emailService = {
    /**
     * Send license key to new PRO customer (purchased via website)
     */
    async sendLicenseKey(email: string, licenseKey: string): Promise<boolean> {
        const client = getResend();
        if (!client) return false;

        try {
            await client.emails.send({
                from: emailFrom,
                to: email,
                subject: '🎉 Your Kybernus PRO License Key',
                html: `
                    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <div style="text-align: center; margin-bottom: 40px;">
                            <h1 style="color: #00f0ff; margin: 0;">⚡ KYBERNUS PRO</h1>
                            <p style="color: #666; margin-top: 8px;">Your Ultimate CLI is Ready</p>
                        </div>
                        
                        <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 16px; padding: 32px; margin-bottom: 32px;">
                            <p style="color: #fff; margin: 0 0 16px 0;">Congratulations! Your PRO license is activated.</p>
                            <p style="color: #888; margin: 0 0 24px 0;">Here's your license key:</p>
                            
                            <div style="background: #111; border: 1px solid #00f0ff; border-radius: 8px; padding: 16px; text-align: center;">
                                <code style="font-size: 18px; color: #00f0ff; font-weight: bold;">${licenseKey}</code>
                            </div>
                        </div>
                        
                        <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 16px; padding: 32px;">
                            <h3 style="color: #fff; margin: 0 0 16px 0;">🚀 Quick Start</h3>
                            <ol style="color: #ccc; margin: 0; padding-left: 20px; line-height: 2;">
                                <li>Install: <code style="background: #222; padding: 2px 8px; border-radius: 4px;">npm install -g kybernus</code></li>
                                <li>Login: <code style="background: #222; padding: 2px 8px; border-radius: 4px;">kybernus login</code></li>
                                <li>Enter your license key when prompted</li>
                                <li>Create: <code style="background: #222; padding: 2px 8px; border-radius: 4px;">kybernus init</code></li>
                            </ol>
                        </div>
                        
                        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
                            Need help? Contact us at contact@kybernus.com
                        </p>
                    </div>
                `,
            });
            console.log('[Email] License key sent to:', email);
            return true;
        } catch (error: any) {
            console.error('[Email] Failed to send license key:', error.message);
            return false;
        }
    },

    /**
     * Send upgrade confirmation to existing user (upgraded via CLI)
     */
    async sendUpgradeConfirmation(email: string, licenseKey: string): Promise<boolean> {
        const client = getResend();
        if (!client) return false;

        try {
            await client.emails.send({
                from: emailFrom,
                to: email,
                subject: '✨ Your Kybernus Upgrade is Complete',
                html: `
                    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <h1 style="color: #00f0ff; text-align: center;">Upgrade Complete! 🎉</h1>
                        
                        <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 16px; padding: 32px; margin: 32px 0;">
                            <p style="color: #fff;">Your new PRO license key:</p>
                            <div style="background: #111; border: 1px solid #00f0ff; border-radius: 8px; padding: 16px; text-align: center;">
                                <code style="font-size: 18px; color: #00f0ff; font-weight: bold;">${licenseKey}</code>
                            </div>
                            <p style="color: #888; font-size: 14px; margin-top: 16px;">
                                Run <code>kybernus login</code> and enter this new key to activate.
                            </p>
                        </div>
                        
                        <p style="color: #666;">You now have access to:</p>
                        <ul style="color: #ccc;">
                            <li>All technology stacks (NestJS, FastAPI, etc.)</li>
                            <li>Clean & Hexagonal architectures</li>
                            <li>AI documentation generation</li>
                            <li>Production-ready DevOps templates</li>
                            <li>Lifetime updates</li>
                        </ul>
                    </div>
                `,
            });
            console.log('[Email] Upgrade confirmation sent to:', email);
            return true;
        } catch (error: any) {
            console.error('[Email] Failed to send upgrade confirmation:', error.message);
            return false;
        }
    },

    /**
     * Send welcome email to new trial user
     */
    async sendWelcome(email: string, licenseKey: string): Promise<boolean> {
        const client = getResend();
        if (!client) return false;

        try {
            await client.emails.send({
                from: emailFrom,
                to: email,
                subject: '🚀 Welcome to Kybernus - Your Trial is Active!',
                html: `
                    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <h1 style="color: #00f0ff; text-align: center;">Welcome to Kybernus!</h1>
                        
                        <p style="color: #fff; text-align: center;">
                            Your trial is active. You can create <strong>3 projects</strong> with full PRO access.
                        </p>
                        
                        <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 16px; padding: 32px; margin: 32px 0;">
                            <p style="color: #888; margin: 0 0 16px 0;">Your license key:</p>
                            <div style="background: #111; border: 1px solid #00f0ff; border-radius: 8px; padding: 16px; text-align: center;">
                                <code style="font-size: 16px; color: #00f0ff;">${licenseKey}</code>
                            </div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; text-align: center;">
                            Ready to build something amazing? Run <code>kybernus init</code>
                        </p>
                    </div>
                `,
            });
            console.log('[Email] Welcome email sent to:', email);
            return true;
        } catch (error: any) {
            console.error('[Email] Failed to send welcome email:', error.message);
            return false;
        }
    },

    /**
     * Send password reset email
     */
    async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
        const client = getResend();
        if (!client) return false;

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010';
        const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

        try {
            await client.emails.send({
                from: emailFrom,
                to: email,
                subject: '🔐 Reset Your Kybernus Password',
                html: `
                    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <h1 style="color: #fff; text-align: center;">Password Reset Request</h1>
                        
                        <p style="color: #ccc; text-align: center;">
                            Click the button below to reset your password. This link expires in 1 hour.
                        </p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${resetUrl}" style="background: #00f0ff; color: #000; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 12px; text-align: center;">
                            If you didn't request this, you can safely ignore this email.
                        </p>
                    </div>
                `,
            });
            console.log('[Email] Password reset sent to:', email);
            return true;
        } catch (error: any) {
            console.error('[Email] Failed to send password reset:', error.message);
            return false;
        }
    },

    /**
     * Send trial limit warning (when user hits 2/3 projects)
     */
    async sendTrialWarning(email: string, usage: number, limit: number): Promise<boolean> {
        const client = getResend();
        if (!client) return false;

        try {
            await client.emails.send({
                from: emailFrom,
                to: email,
                subject: '⚠️ Kybernus Trial: 1 Project Remaining',
                html: `
                    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <h1 style="color: #fbbf24; text-align: center;">1 Project Left!</h1>
                        
                        <p style="color: #fff; text-align: center;">
                            You've used <strong>${usage}/${limit}</strong> of your trial projects.
                        </p>
                        
                        <p style="color: #ccc; text-align: center;">
                            Upgrade to PRO for unlimited projects and lifetime access.
                        </p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kybernus.com'}/#pricing" style="background: #b026ff; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                                Upgrade to PRO - $97
                            </a>
                        </div>
                    </div>
                `,
            });
            console.log('[Email] Trial warning sent to:', email);
            return true;
        } catch (error: any) {
            console.error('[Email] Failed to send trial warning:', error.message);
            return false;
        }
    },
};
