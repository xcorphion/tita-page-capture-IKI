import nodemailer from 'nodemailer';

let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host:       process.env.SMTP_HOST,
      port:       parseInt(process.env.SMTP_PORT || '587'),
      secure:     process.env.SMTP_SECURE === 'true',
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
  }
  return _transporter;
}

export async function sendMail({ to, subject, html }) {
  return getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}

// Fire-and-forget — swallows errors, logs them. Use for non-critical side-effect emails.
export function sendMailSilent(opts) {
  sendMail(opts).catch(err => console.error('[mailer:silent]', err.message));
}
