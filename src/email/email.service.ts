import { Injectable } from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";
import {UserEntity} from "../users/entities/user.entity";

@Injectable()
export class EmailService {
    constructor(private mailerService: MailerService) {}

    async sendUserConfirmation(user: UserEntity, code: string) {
        //const url = `example.com/auth/confirm?token=${token}`;

        await this.mailerService.sendMail({
            to: user.email_address,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Welcome to Avado Finance! Confirm your Email',
            template: './confirmation', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: user.full_name,
                code,
            },
        });
    }

    async sendUserResetPassword(user: UserEntity, url: string) {
        //const url = `example.com/auth/confirm?token=${token}`;

        await this.mailerService.sendMail({
            to: user.email_address,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Password Reset | Avado Finance',
            template: './reset-password', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: user.full_name,
                url,
            },
        });
    }

    /*async sendTestEmail(recipient: string, body = 'This is a test mail'): Promise<void> {
        const options: MailgunMessageData = {
            from: 'Excited User <me@samples.mailgun.org>',
            to: recipient,
            subject: 'Test Email',
            text: body,
            html: '',
            attachment: '',
            cc: '',
            bcc: '',
            'o:testmode': 'no',
            'h:X-Mailgun-Variables': '{"key":"value"}',
        };
        this.client.messages
            .create(this.MAILGUN_DOMAIN, options)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.error(err);
            });
    }*/
}