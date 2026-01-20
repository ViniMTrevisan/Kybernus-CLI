import { Resend } from 'resend';

// Lazy initialization to avoid errors when API key is not set
let resend: Resend | null = null;

function getResend(): Resend | null {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
        console.warn('[Email] RESEND_API_KEY not configured, emails will be skipped');
        return null;
    }
    if (!resend) {
        resend = new Resend(resendApiKey);
    }
    return resend;
}

function getEmailFrom(): string {
    return process.env.EMAIL_FROM || 'Kybernus <noreply@kybernus.com>';
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
                from: getEmailFrom(),
                to: email,
                subject: '🎉 Your Kybernus PRO License Key',
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1a1a1a; line-height: 1.6;">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(to right, #000000, #1a1a1a); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #00f0ff; margin: 0; font-size: 28px; letter-spacing: 2px;">KYBERNUS</h1>
                            <p style="color: #a0a0a0; margin: 8px 0 0; font-size: 14px; text-transform: uppercase;">The Ultimate CLI for Developers</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
                            <h2 style="color: #1a1a1a; margin-top: 0;">Your PRO License is Ready 🚀</h2>
                            <p style="font-size: 16px; color: #4a4a4a;">
                                Thank you for your purchase! You now have unlimited access to all Kybernus features, templates, and architectures.
                            </p>
                            
                            <!-- License Box -->
                            <div style="background-color: #f5f7fa; border: 2px dashed #00f0ff; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                                <p style="margin: 0 0 10px; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Your License Key</p>
                                <code style="display: block; font-size: 24px; font-weight: bold; color: #000; font-family: 'Courier New', monospace; letter-spacing: 1px;">${licenseKey}</code>
                            </div>
                            
                            <h3 style="color: #1a1a1a; font-size: 18px;">How to Activate</h3>
                            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                                <ol style="margin: 0; padding-left: 20px; color: #4a4a4a;">
                                    <li style="margin-bottom: 10px;">Run <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; color: #c026d3;">kybernus login</code> in your terminal</li>
                                    <li style="margin-bottom: 10px;">Paste your license key when prompted</li>
                                    <li>Start building with <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; color: #c026d3;">kybernus init</code></li>
                                </ol>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="text-align: center; padding-top: 30px; font-size: 12px; color: #888;">
                            <p>Need help? Reply to this email or contact support.</p>
                            <p>&copy; ${new Date().getFullYear()} Kybernus. All rights reserved.</p>
                        </div>
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
                from: getEmailFrom(),
                to: email,
                subject: '✨ Upgrade Complete: Welcome to PRO',
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1a1a1a; line-height: 1.6;">
                        
                        <div style="background: linear-gradient(to right, #000000, #1a1a1a); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #00f0ff; margin: 0; font-size: 28px; letter-spacing: 2px;">KYBERNUS</h1>
                        </div>
                        
                        <div style="padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
                            <h2 style="color: #1a1a1a; margin-top: 0; text-align: center;">Upgrade Successful! 🎉</h2>
                            <p style="font-size: 16px; color: #4a4a4a; text-align: center;">
                                Your account has been upgraded to PRO. Here is your new license key:
                            </p>
                            
                            <div style="background-color: #f5f7fa; border: 2px dashed #00f0ff; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                                <code style="display: block; font-size: 24px; font-weight: bold; color: #000; font-family: 'Courier New', monospace; letter-spacing: 1px;">${licenseKey}</code>
                            </div>
                            
                            <p style="text-align: center; color: #666; font-size: 14px;">
                                Please run <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; color: #c026d3;">kybernus login</code> again to update your local CLI license.
                            </p>
                        </div>

                        <div style="text-align: center; padding-top: 30px; font-size: 12px; color: #888;">
                            <p>&copy; ${new Date().getFullYear()} Kybernus. All rights reserved.</p>
                        </div>
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
                from: getEmailFrom(),
                to: email,
                subject: '🚀 Welcome to Kybernus - Trial Activated',
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1a1a1a; line-height: 1.6;">
                        
                        <div style="background: linear-gradient(to right, #000000, #1a1a1a); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #00f0ff; margin: 0; font-size: 28px; letter-spacing: 2px;">KYBERNUS</h1>
                        </div>
                        
                        <div style="padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
                            <h2 style="color: #1a1a1a; margin-top: 0;">Welcome Aboard! ⚡</h2>
                            <p style="font-size: 16px; color: #4a4a4a;">
                                We're excited to have you. Your trial is now active with full PRO features.
                            </p>
                            
                            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                <strong style="color: #166534; display: block; margin-bottom: 5px;">Trial Limits:</strong>
                                <ul style="margin: 0; padding-left: 20px; color: #166534;">
                                    <li>3 Projects Max</li>
                                    <li>All Architectures Unlocked</li>
                                </ul>
                            </div>

                            <div style="background-color: #f5f7fa; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                                <p style="margin: 0 0 10px; font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold;">Your Trial License Key</p>
                                <code style="display: block; font-size: 20px; font-weight: bold; color: #2563eb; font-family: 'Courier New', monospace;">${licenseKey}</code>
                            </div>
                            
                            <p style="font-size: 14px; color: #666;">
                                To start, run: <br>
                                <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 5px;">kybernus init</code>
                            </p>
                        </div>
                        
                        <div style="text-align: center; padding-top: 30px; font-size: 12px; color: #888;">
                            <p>&copy; ${new Date().getFullYear()} Kybernus. All rights reserved.</p>
                        </div>
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
                from: getEmailFrom(),
                to: email,
                subject: '🔐 Reset Your Password',
                html: `
                   <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1a1a1a; line-height: 1.6;">
                        
                        <div style="background: linear-gradient(to right, #000000, #1a1a1a); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #fff; margin: 0; font-size: 24px;">Password Reset</h1>
                        </div>
                        
                        <div style="padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="font-size: 16px; color: #4a4a4a; margin-bottom: 30px;">
                                We received a request to reset your password. Click the button below to proceed:
                            </p>
                            
                            <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px;">
                                Reset Password
                            </a>
                            
                            <p style="margin-top: 30px; font-size: 14px; color: #888;">
                                This link expires in 1 hour. If you didn't request this, please ignore this email.
                            </p>
                        </div>
                        
                        <div style="text-align: center; padding-top: 30px; font-size: 12px; color: #888;">
                            <p>&copy; ${new Date().getFullYear()} Kybernus. All rights reserved.</p>
                        </div>
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
                from: getEmailFrom(),
                to: email,
                subject: '⚠️ Kybernus Trial: Project Limit Warning',
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1a1a1a; line-height: 1.6;">
                        
                        <div style="background: #f59e0b; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #fff; margin: 0; font-size: 24px;">Trial Limit Approaching</h1>
                        </div>
                        
                        <div style="padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="font-size: 18px; color: #4a4a4a;">
                                You have used <strong>${usage} of ${limit}</strong> projects in your trial.
                            </p>
                            
                            <p style="color: #666; margin-bottom: 30px;">
                                Upgrade to PRO today for unlimited projects and lifetime updates.
                            </p>
                            
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kybernus.com'}/#pricing" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px;">
                                Upgrade to PRO - $97
                            </a>
                        </div>
                        
                        <div style="text-align: center; padding-top: 30px; font-size: 12px; color: #888;">
                            <p>&copy; ${new Date().getFullYear()} Kybernus. All rights reserved.</p>
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
