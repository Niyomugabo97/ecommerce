import { BrevoClient } from "@getbrevo/brevo";

import { WelcomeEmailTemplate } from "../template/welcomeTemplateemail";

const getTransactionalEmailsApi = (): BrevoClient => {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        throw new Error("Missing Brevo API key");
    }

    return new BrevoClient({ apiKey });
};

//send welcome email
export const sendWelcomeEmail = async (
    email: string,
    name: string
): Promise<void> => {
    const api = getTransactionalEmailsApi();

    await api.transactionalEmails.sendTransacEmail({
        sender: {
            name: "claude Niyomugabo",
            email: process.env.BREVO_SENDER_EMAIL
        },
        to: [{
            email
        }],
        subject: "Welcome to our E-commerce App",
        htmlContent: WelcomeEmailTemplate(name)
    });
};

// Send a short-lived password reset code.
export const sendPasswordResetCodeEmail = async (
    to: string,
    code: string
): Promise<void> => {
    const api = getTransactionalEmailsApi();
    const subject = "Password Reset code";
    const html = `
    <p>Dear user,</p>
        <p>Your password reset code is: <strong>${code}</strong></p>
        <p>This code expires in 10 minutes. If you did not request a reset, you can ignore this email.</p>
    `;

    await api.transactionalEmails.sendTransacEmail({
        sender: {
        
            email: process.env.BREVO_SENDER_EMAIL
        },
        to: [{ email: to }],
        subject,
        htmlContent: html
    });
};
