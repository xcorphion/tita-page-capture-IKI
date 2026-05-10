import { connectToDatabase } from '../../../lib/mongodb';
import nodemailer from 'nodemailer';
import { rateLimit } from '../../../lib/rateLimit';
import { SESSION_STATUS } from '../../../lib/schema';

const CONSENT_TEXT = 'SIM, EU ACEITO';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (rateLimit(req, { max: 3, windowMs: 60 * 60_000 }))
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' });

  const { participant_code, email, consent_text } = req.body || {};

  if (consent_text !== CONSENT_TEXT)
    return res.status(400).json({ error: 'Consentimento inválido.' });

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return res.status(400).json({ error: 'E-mail inválido.' });

  const code = typeof participant_code === 'string' ? participant_code.trim().toUpperCase() : '';
  if (!code)
    return res.status(400).json({ error: 'Código de participante ausente.' });

  try {
    const db = await connectToDatabase();
    const participant = await db.collection('participants').findOne({ participant_code: code });

    if (!participant)
      return res.status(404).json({ error: 'Participante não encontrado.' });

    if (participant.session_1_status !== SESSION_STATUS.CONCLUIDA)
      return res.status(403).json({ error: 'Sessão 1 não concluída.' });

    await db.collection('participants').updateOne(
      { participant_code: code },
      { $set: { contact_email: email.trim().toLowerCase(), link_sent_at: new Date() } }
    );

    const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online';
    const studyLink = `${platformUrl}/study?code=${code}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email.trim(),
      subject: 'Seu acesso à pesquisa OMMΩ — Xcorphion',
      html: `
<!DOCTYPE html>
<html lang="pt-br">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 24px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
        <tr><td style="padding-bottom:32px">
          <span style="font-family:sans-serif;font-size:11px;color:#8B0000;letter-spacing:0.14em;text-transform:uppercase">
            Xcorphion Research
          </span>
        </td></tr>
        <tr><td style="padding-bottom:20px">
          <h1 style="font-family:sans-serif;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.025em;margin:0;line-height:1.15">
            Sessão 1 concluída.
          </h1>
        </td></tr>
        <tr><td style="padding-bottom:36px">
          <p style="font-family:sans-serif;font-size:15px;color:rgba(255,255,255,0.55);line-height:1.75;margin:0">
            Obrigado pela participação. Quando a Sessão 2 abrir, você receberá uma notificação neste endereço.<br><br>
            Guarde o link abaixo — ele é o seu acesso exclusivo à área de pesquisa:
          </p>
        </td></tr>
        <tr><td style="padding-bottom:36px">
          <a href="${studyLink}"
            style="display:inline-block;background:#8B0000;color:#ffffff;padding:13px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-size:14px;font-weight:500">
            Acessar área de pesquisa →
          </a>
        </td></tr>
        <tr><td style="border-top:1px solid rgba(255,255,255,0.07);padding-top:28px">
          <p style="font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.65;margin:0">
            Xcorphion Corporation · <a href="${platformUrl}" style="color:rgba(255,255,255,0.3);text-decoration:none">xcorphion.online</a><br>
            Código do participante: <strong style="color:rgba(255,255,255,0.35);letter-spacing:0.1em">${code}</strong><br><br>
            Se você não solicitou este e-mail, ignore-o.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[send-link]', e.message);
    return res.status(500).json({ error: 'Erro ao enviar. Tente novamente.' });
  }
}
