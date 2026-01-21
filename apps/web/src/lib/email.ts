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

const styles = {
    container: "background-color: #0a0a0b; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; width: 100%;",
    wrapper: "max-width: 600px; margin: 40px auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 0;",
    header: "padding: 30px 40px; border-bottom: 1px solid #27272a; background-color: #0a0a0b; text-align: center;",
    logo: "color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 0; text-transform: uppercase;",
    content: "padding: 40px;",
    heading: "color: #ffffff; font-size: 20px; font-weight: bold; margin: 0 0 20px; text-transform: uppercase; letter-spacing: 0.5px;",
    text: "color: #a1a1aa; font-size: 14px; margin: 0 0 20px;",
    codeBox: "background-color: #000000; border: 1px solid #27272a; padding: 20px; margin: 25px 0; text-align: center; border-radius: 4px;",
    code: "color: #00f0ff; font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; letter-spacing: 1px;",
    codeBlock: "background-color: #27272a; color: #ffffff; padding: 2px 6px; border-radius: 2px; font-family: 'Courier New', monospace; font-size: 13px;",
    button: "display: inline-block; background-color: #00f0ff; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 0; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; margin-top: 10px;",
    footer: "padding: 30px; background-color: #0a0a0b; border-top: 1px solid #27272a; text-align: center; color: #52525b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;",
    accentPurple: "color: #b026ff;",
    accentBlue: "color: #00f0ff;",
    list: "margin: 0; padding-left: 20px; color: #a1a1aa;",
    listItem: "margin-bottom: 10px; font-size: 14px;"
};

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
                subject: 'ACCESS GRANTED: Kybernus PRO License',
                html: `
                    <div style="${styles.container}">
                        <div style="${styles.wrapper}">
                            <div style="${styles.header}">
                                <h1 style="${styles.logo}">KYBERNUS <span style="${styles.accentPurple}">PRO</span></h1>
                            </div>
                            
                            <div style="${styles.content}">
                                <h2 style="${styles.heading}">System Access Application: <span style="${styles.accentBlue}">APPROVED</span></h2>
                                <p style="${styles.text}">
                                    Welcome to the architecture elite. Your PRO license key has been generated and is ready for immediate deployment.
                                </p>
                                
                                <div style="${styles.codeBox}">
                                    <p style="margin: 0 0 10px; font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 1px;">License Key</p>
                                    <code style="${styles.code}">${licenseKey}</code>
                                </div>
                                
                                <h3 style="color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Initialization Protocol</h3>
                                <div style="background-color: #0a0a0b; border: 1px solid #27272a; padding: 20px;">
                                    <ol style="${styles.list}">
                                        <li style="${styles.listItem}">Open your terminal</li>
                                        <li style="${styles.listItem}">Execute: <span style="${styles.codeBlock}">kybernus login</span></li>
                                        <li style="${styles.listItem}">Input your license key</li>
                                        <li style="${styles.listItem}">Initialize: <span style="${styles.codeBlock}">kybernus init</span></li>
                                    </ol>
                                </div>
                            </div>
                            
                            <div style="${styles.footer}">
                                <p>&copy; ${new Date().getFullYear()} Kybernus Systems. All rights reserved.</p>
                            </div>
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
                subject: 'UPGRADE COMPLETE: Level Up',
                html: `
                    <div style="${styles.container}">
                        <div style="${styles.wrapper}">
                            <div style="${styles.header}">
                                <h1 style="${styles.logo}">KYBERNUS</h1>
                            </div>
                            
                            <div style="${styles.content}">
                                <h2 style="${styles.heading}">Upgrade Status: <span style="color: #22c55e;">SUCCESSFUL</span></h2>
                                <p style="${styles.text}">
                                    Your account privileges have been elevated. You generally have full access to all Kybernus architectural patterns.
                                </p>
                                
                                <div style="${styles.codeBox}">
                                    <p style="margin: 0 0 10px; font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 1px;">New License Credentials</p>
                                    <code style="${styles.code}">${licenseKey}</code>
                                </div>
                                
                                <p style="${styles.text}">
                                    Please re-authenticate your CLI client to sync these changes.
                                </p>
                                <div style="text-align: center;">
                                    <span style="${styles.codeBlock}">kybernus login</span>
                                </div>
                            </div>

                            <div style="${styles.footer}">
                                <p>&copy; ${new Date().getFullYear()} Kybernus Systems. All rights reserved.</p>
                            </div>
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
                subject: 'TRIAL INITIALIZED: Welcome to Kybernus',
                html: `
                    <div style="${styles.container}">
                        <div style="${styles.wrapper}">
                            <div style="${styles.header}">
                                <h1 style="${styles.logo}">KYBERNUS</h1>
                            </div>
                            
                            <div style="${styles.content}">
                                <h2 style="${styles.heading}">Sequence: <span style="${styles.accentBlue}">INITIATED</span></h2>
                                <p style="${styles.text}">
                                    Welcome aboard. Your trial environment has been provisioned with full PRO capabilities.
                                </p>
                                
                                <div style="border-left: 2px solid #eab308; background-color: #1a1500; padding: 15px; margin-bottom: 25px;">
                                    <strong style="color: #eab308; display: block; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Trial Parameters:</strong>
                                    <ul style="margin: 0; padding-left: 20px; color: #a1a1aa; font-size: 13px;">
                                        <li>3 Project Generation Limit</li>
                                        <li>Full Architecture Library Access</li>
                                    </ul>
                                </div>

                                <div style="${styles.codeBox}">
                                    <p style="margin: 0 0 10px; font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 1px;">Trial License Key</p>
                                    <code style="${styles.code}">${licenseKey}</code>
                                </div>
                                
                                <p style="${styles.text}">
                                    Begin by initializing your first project:
                                </p>
                                <div style="text-align: center;">
                                    <span style="${styles.codeBlock}">kybernus init</span>
                                </div>
                            </div>
                            
                            <div style="${styles.footer}">
                                <p>&copy; ${new Date().getFullYear()} Kybernus Systems. All rights reserved.</p>
                            </div>
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
                subject: 'SECURITY ALERT: Password Reset Request',
                html: `
                    <div style="${styles.container}">
                        <div style="${styles.wrapper}">
                            <div style="${styles.header}">
                                <h1 style="${styles.logo}">KYBERNUS <span style="color: #ef4444;">SECURITY</span></h1>
                            </div>
                            
                            <div style="${styles.content}">
                                <h2 style="${styles.heading}">Reset Authorization</h2>
                                <p style="${styles.text}">
                                    A manual override of your access credentials has been requested. If this was you, verify by clicking the link below.
                                </p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${resetUrl}" style="${styles.button}">
                                        Reset Credentials
                                    </a>
                                </div>
                                
                                <p style="font-size: 12px; color: #52525b; text-align: center;">
                                    This link is valid for 60 minutes. If you did not initiate this request, engage security protocols immediately.
                                </p>
                            </div>
                            
                            <div style="${styles.footer}">
                                <p>&copy; ${new Date().getFullYear()} Kybernus Systems. All rights reserved.</p>
                            </div>
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
                subject: 'CAPACITY WARNING: Trial Limit Approaching',
                html: `
                    <div style="${styles.container}">
                        <div style="${styles.wrapper}">
                            <div style="${styles.header}">
                                <h1 style="${styles.logo}">KYBERNUS</h1>
                            </div>
                            
                            <div style="background-color: #f59e0b; padding: 10px; text-align: center;">
                                <p style="margin: 0; color: #000000; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Usage Threshold Alert</p>
                            </div>
                            
                            <div style="${styles.content}">
                                <h2 style="${styles.heading}">Capacity Status: <span style="color: #f59e0b;">CRITICAL</span></h2>
                                <p style="${styles.text}">
                                    You have utilized <strong>${usage}/${limit}</strong> of your allocated trial projects. 
                                </p>
                                
                                <div style="background-color: #0a0a0b; border: 1px solid #27272a; height: 4px; width: 100%; margin: 20px 0; border-radius: 2px;">
                                    <div style="background-color: #f59e0b; height: 100%; width: ${(usage / limit) * 100}%;"></div>
                                </div>
                                
                                <p style="${styles.text}">
                                    Upgrade to PRO status to remove all restrictions and unlock unlimited generation capabilities.
                                </p>
                                
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kybernus.com'}/#pricing" style="${styles.button}">
                                        Upgrade to PRO
                                    </a>
                                </div>
                            </div>
                            
                            <div style="${styles.footer}">
                                <p>&copy; ${new Date().getFullYear()} Kybernus Systems. All rights reserved.</p>
                            </div>
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

