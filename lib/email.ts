import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  const params = {
    Source: process.env.AWS_SES_FROM_EMAIL!,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'メールアドレスの確認',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: `
            <h1>メールアドレスの確認</h1>
            <p>以下のリンクをクリックして、メールアドレスを確認してください：</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>このリンクは24時間有効です。</p>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('メールの送信に失敗しました');
  }
} 