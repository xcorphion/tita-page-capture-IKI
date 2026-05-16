import { escapeHtml as esc } from './security';

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online';

// All dynamic interpolations pass through esc() — participant-controlled fields
// (names, codes) must never reach the rendered HTML unescaped, since they end
// up in real inboxes (including the inboxes of *other* participants for the
// referral flow).

const LANG_ATTR = { pt: 'pt-BR', en: 'en', es: 'es' };

function getStrings(locale = 'pt') {
  const s = {
    pt: {
      unsubscribe: 'Se você não solicitou este e-mail, ignore-o.',
      codeLabel: 'Seu código de acesso',
      participantCode: 'Código do participante',
      // E01
      e01subject: 'Bem-vindo à pesquisa OMMΩ — Xcorphion',
      e01h1: 'Bem-vindo à pesquisa OMMΩ.',
      e01para: (name) => `Olá, ${name}. Seu perfil foi criado com sucesso. Guarde o código abaixo — ele é o seu acesso exclusivo a todas as sessões.`,
      e01btn: 'Iniciar Sessão 1',
      // E02
      e02subject: 'Seu código de acesso — Xcorphion',
      e02h1: 'Seu código de acesso.',
      e02para: (name) => `Olá, ${name}. Você solicitou o lembrete do seu código de participante.`,
      e02btn: 'Acessar pesquisa',
      // E03
      e03subject: 'Seu acesso à pesquisa OMMΩ — Xcorphion',
      e03h1: 'Sessão 1 concluída.',
      e03para: 'Obrigado pela participação. Quando a Sessão 2 abrir, você receberá uma notificação neste endereço.<br><br>Guarde o link abaixo — ele é o seu acesso exclusivo à área de pesquisa:',
      e03btn: 'Acessar área de pesquisa',
      // E04/E05
      e04subject: (s) => `Sessão ${s} liberada — Xcorphion`,
      e04h1: (s) => `Sessão ${s} liberada.`,
      e04para: (name, s) => `Olá, ${name}. Sua Sessão ${s} foi autorizada e está disponível agora. Acesse a pesquisa pelo link abaixo.`,
      e04btn: (s) => `Iniciar Sessão ${s}`,
      // E06
      e06subject: 'Acesse a pesquisa em outro dispositivo — Xcorphion',
      e06h1: 'Acesse em outro dispositivo.',
      e06para: (name, conect) => `Olá, ${name}. Seu equipamento atual não é válido para a pesquisa. Abra <strong style="color:rgba(255,255,255,0.7)">${conect}</strong> em um computador ou notebook e insira o código abaixo.`,
      // E07
      e07subject: 'Pesquisa concluída — Xcorphion',
      e07h1: 'Pesquisa concluída.',
      e07para1: (name) => `Olá, ${name}. Você completou as 3 sessões da pesquisa OMMΩ. Obrigado pela sua contribuição — seus dados são parte fundamental do desenvolvimento do sistema.`,
      e07para2: 'Fique de olho no seu e-mail: em breve compartilharemos os resultados do estudo com todos os participantes.',
      // E08
      e08subject: (refName) => `${refName} te convidou para a pesquisa OMMΩ`,
      e08h1: (refName) => `${refName} te convidou.`,
      e08para: (refName) => `<strong style="color:rgba(255,255,255,0.8)">${refName}</strong> convidou você para participar da pesquisa OMMΩ da Xcorphion — um estudo sobre o ritmo somático da digitação e inteligência artificial.<br><br>A participação leva entre 8 e 15 minutos e requer teclado físico.`,
      e08btn: 'Aceitar convite e participar',
      // E09
      e09subject: 'Seu convite foi aceito — Xcorphion',
      e09h1: 'Seu convite foi aceito.',
      e09para: (refName, newName) => `Olá, ${refName}. <strong style="color:rgba(255,255,255,0.8)">${newName}</strong> usou seu convite e entrou na pesquisa OMMΩ. Obrigado por expandir a nossa base de dados.`,
      // E10
      e10subject: 'Você está na lista — Xcorphion',
      e10h1: 'Você está na lista.',
      e10para: 'Recebemos sua inscrição na lista de espera do OMMΩ. Quando as próximas sessões abrirem, você será o primeiro a saber.<br><br>Não precisa fazer nada agora.',
      // E11
      e11subject: 'O OMMΩ chegou — Xcorphion',
      e11h1: 'O OMMΩ chegou.',
      e11para: 'A plataforma que aprende com o ritmo do seu teclado está disponível. Você foi um dos primeiros a se inscrever na lista de espera — agora é a sua vez.',
      e11btn: 'Acessar o OMMΩ',
      // E14
      e14subject: (s) => `Sessão ${s} disponível — Xcorphion`,
      e14h1: (s) => `Sua Sessão ${s} ainda está disponível.`,
      e14para: (name, s) => `Olá, ${name}. Sua Sessão ${s} foi liberada há alguns dias e ainda não foi iniciada. Quando você estiver pronto, o link abaixo está te esperando.`,
      e14btn: (s) => `Acessar Sessão ${s}`,
    },
    en: {
      unsubscribe: 'If you did not request this email, please ignore it.',
      codeLabel: 'Your access code',
      participantCode: 'Participant code',
      // E01
      e01subject: 'Welcome to the OMMΩ research — Xcorphion',
      e01h1: 'Welcome to the OMMΩ research.',
      e01para: (name) => `Hello, ${name}. Your profile has been successfully created. Save the code below — it is your exclusive access to all sessions.`,
      e01btn: 'Start Session 1',
      // E02
      e02subject: 'Your access code — Xcorphion',
      e02h1: 'Your access code.',
      e02para: (name) => `Hello, ${name}. You requested a reminder of your participant code.`,
      e02btn: 'Access research',
      // E03
      e03subject: 'Your access to the OMMΩ research — Xcorphion',
      e03h1: 'Session 1 completed.',
      e03para: 'Thank you for your participation. When Session 2 opens, you will receive a notification at this address.<br><br>Save the link below — it is your exclusive access to the research area:',
      e03btn: 'Access research area',
      // E04/E05
      e04subject: (s) => `Session ${s} unlocked — Xcorphion`,
      e04h1: (s) => `Session ${s} unlocked.`,
      e04para: (name, s) => `Hello, ${name}. Your Session ${s} has been authorized and is now available. Access the research via the link below.`,
      e04btn: (s) => `Start Session ${s}`,
      // E06
      e06subject: 'Access the research on another device — Xcorphion',
      e06h1: 'Access from another device.',
      e06para: (name, conect) => `Hello, ${name}. Your current device is not valid for the research. Open <strong style="color:rgba(255,255,255,0.7)">${conect}</strong> on a computer or laptop and enter the code below.`,
      // E07
      e07subject: 'Research completed — Xcorphion',
      e07h1: 'Research completed.',
      e07para1: (name) => `Hello, ${name}. You have completed all 3 sessions of the OMMΩ research. Thank you for your contribution — your data is a fundamental part of the system's development.`,
      e07para2: 'Keep an eye on your email: we will soon share the study results with all participants.',
      // E08
      e08subject: (refName) => `${refName} invited you to the OMMΩ research`,
      e08h1: (refName) => `${refName} invited you.`,
      e08para: (refName) => `<strong style="color:rgba(255,255,255,0.8)">${refName}</strong> invited you to participate in Xcorphion's OMMΩ research — a study on the somatic rhythm of typing and artificial intelligence.<br><br>Participation takes between 8 and 15 minutes and requires a physical keyboard.`,
      e08btn: 'Accept invitation and participate',
      // E09
      e09subject: 'Your invitation was accepted — Xcorphion',
      e09h1: 'Your invitation was accepted.',
      e09para: (refName, newName) => `Hello, ${refName}. <strong style="color:rgba(255,255,255,0.8)">${newName}</strong> used your invitation and joined the OMMΩ research. Thank you for expanding our database.`,
      // E10
      e10subject: "You're on the list — Xcorphion",
      e10h1: "You're on the list.",
      e10para: 'We have received your registration for the OMMΩ waiting list. When the next sessions open, you will be the first to know.<br><br>No action needed for now.',
      // E11
      e11subject: 'OMMΩ is here — Xcorphion',
      e11h1: 'OMMΩ is here.',
      e11para: 'The platform that learns from your typing rhythm is now available. You were among the first to sign up for the waiting list — now it is your turn.',
      e11btn: 'Access OMMΩ',
      // E14
      e14subject: (s) => `Session ${s} available — Xcorphion`,
      e14h1: (s) => `Your Session ${s} is still available.`,
      e14para: (name, s) => `Hello, ${name}. Your Session ${s} was unlocked a few days ago and has not been started yet. When you are ready, the link below is waiting for you.`,
      e14btn: (s) => `Access Session ${s}`,
    },
    es: {
      unsubscribe: 'Si no solicitaste este correo electrónico, ignóralo.',
      codeLabel: 'Tu código de acceso',
      participantCode: 'Código del participante',
      // E01
      e01subject: 'Bienvenido a la investigación OMMΩ — Xcorphion',
      e01h1: 'Bienvenido a la investigación OMMΩ.',
      e01para: (name) => `Hola, ${name}. Tu perfil ha sido creado con éxito. Guarda el código a continuación — es tu acceso exclusivo a todas las sesiones.`,
      e01btn: 'Iniciar Sesión 1',
      // E02
      e02subject: 'Tu código de acceso — Xcorphion',
      e02h1: 'Tu código de acceso.',
      e02para: (name) => `Hola, ${name}. Solicitaste un recordatorio de tu código de participante.`,
      e02btn: 'Acceder a la investigación',
      // E03
      e03subject: 'Tu acceso a la investigación OMMΩ — Xcorphion',
      e03h1: 'Sesión 1 completada.',
      e03para: 'Gracias por tu participación. Cuando se abra la Sesión 2, recibirás una notificación en esta dirección.<br><br>Guarda el enlace a continuación — es tu acceso exclusivo al área de investigación:',
      e03btn: 'Acceder al área de investigación',
      // E04/E05
      e04subject: (s) => `Sesión ${s} habilitada — Xcorphion`,
      e04h1: (s) => `Sesión ${s} habilitada.`,
      e04para: (name, s) => `Hola, ${name}. Tu Sesión ${s} ha sido autorizada y está disponible ahora. Accede a la investigación mediante el enlace a continuación.`,
      e04btn: (s) => `Iniciar Sesión ${s}`,
      // E06
      e06subject: 'Accede a la investigación en otro dispositivo — Xcorphion',
      e06h1: 'Accede desde otro dispositivo.',
      e06para: (name, conect) => `Hola, ${name}. Tu equipo actual no es válido para la investigación. Abre <strong style="color:rgba(255,255,255,0.7)">${conect}</strong> en un ordenador o portátil e introduce el código a continuación.`,
      // E07
      e07subject: 'Investigación completada — Xcorphion',
      e07h1: 'Investigación completada.',
      e07para1: (name) => `Hola, ${name}. Completaste las 3 sesiones de la investigación OMMΩ. Gracias por tu contribución — tus datos son una parte fundamental del desarrollo del sistema.`,
      e07para2: 'Atentos a tu correo electrónico: pronto compartiremos los resultados del estudio con todos los participantes.',
      // E08
      e08subject: (refName) => `${refName} te invitó a la investigación OMMΩ`,
      e08h1: (refName) => `${refName} te invitó.`,
      e08para: (refName) => `<strong style="color:rgba(255,255,255,0.8)">${refName}</strong> te invitó a participar en la investigación OMMΩ de Xcorphion — un estudio sobre el ritmo somático de la escritura y la inteligencia artificial.<br><br>La participación tarda entre 8 y 15 minutos y requiere teclado físico.`,
      e08btn: 'Aceptar invitación y participar',
      // E09
      e09subject: 'Tu invitación fue aceptada — Xcorphion',
      e09h1: 'Tu invitación fue aceptada.',
      e09para: (refName, newName) => `Hola, ${refName}. <strong style="color:rgba(255,255,255,0.8)">${newName}</strong> usó tu invitación y se unió a la investigación OMMΩ. Gracias por expandir nuestra base de datos.`,
      // E10
      e10subject: 'Estás en la lista — Xcorphion',
      e10h1: 'Estás en la lista.',
      e10para: 'Recibimos tu registro en la lista de espera de OMMΩ. Cuando se abran las próximas sesiones, serás el primero en saberlo.<br><br>No necesitas hacer nada por ahora.',
      // E11
      e11subject: 'OMMΩ ha llegado — Xcorphion',
      e11h1: 'OMMΩ ha llegado.',
      e11para: 'La plataforma que aprende del ritmo de tu escritura ya está disponible. Fuiste de los primeros en inscribirte en la lista de espera — ahora es tu turno.',
      e11btn: 'Acceder a OMMΩ',
      // E14
      e14subject: (s) => `Sesión ${s} disponible — Xcorphion`,
      e14h1: (s) => `Tu Sesión ${s} aún está disponible.`,
      e14para: (name, s) => `Hola, ${name}. Tu Sesión ${s} fue habilitada hace unos días y aún no ha sido iniciada. Cuando estés listo, el enlace a continuación te está esperando.`,
      e14btn: (s) => `Acceder a Sesión ${s}`,
    },
  };
  return s[locale] || s.pt;
}

// ─── Base layout ──────────────────────────────────────────────────────────────
function base(content, footerNote = '', locale = 'pt') {
  const t = getStrings(locale);
  const lang = LANG_ATTR[locale] || 'pt-BR';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 24px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
        <tr><td style="padding-bottom:32px">
          <span style="font-family:sans-serif;font-size:11px;color:#8B0000;letter-spacing:0.14em;text-transform:uppercase">Xcorphion Research</span>
        </td></tr>
        ${content}
        <tr><td style="border-top:1px solid rgba(255,255,255,0.07);padding-top:28px">
          <p style="font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.65;margin:0">
            Xcorphion Corporation · <a href="${PLATFORM_URL}" style="color:rgba(255,255,255,0.3);text-decoration:none">xcorphion.online</a>
            ${footerNote ? `<br>${footerNote}` : ''}
            <br><br>${t.unsubscribe}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function h1(text) {
  return `<tr><td style="padding-bottom:20px">
    <h1 style="font-family:sans-serif;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.025em;margin:0;line-height:1.15">${text}</h1>
  </td></tr>`;
}

function para(text) {
  return `<tr><td style="padding-bottom:32px">
    <p style="font-family:sans-serif;font-size:15px;color:rgba(255,255,255,0.55);line-height:1.75;margin:0">${text}</p>
  </td></tr>`;
}

// Validate href is a benign scheme — emails should never carry javascript:/data: URIs.
function safeHref(href) {
  const s = typeof href === 'string' ? href.trim() : '';
  if (/^(https?:|mailto:|tel:)/i.test(s)) return esc(s);
  return '#';
}

function btn(label, href) {
  return `<tr><td style="padding-bottom:36px">
    <a href="${safeHref(href)}" style="display:inline-block;background:#8B0000;color:#ffffff;padding:13px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-size:14px;font-weight:500">${esc(label)} →</a>
  </td></tr>`;
}

function codeBlock(code, locale = 'pt') {
  const t = getStrings(locale);
  return `<tr><td style="padding-bottom:32px">
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:20px 24px;text-align:center">
      <p style="font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px">${t.codeLabel}</p>
      <span style="font-family:sans-serif;font-size:34px;font-weight:700;color:#ffffff;letter-spacing:0.2em">${esc(code)}</span>
    </div>
  </td></tr>`;
}

function footerCode(code, locale = 'pt') {
  const t = getStrings(locale);
  return `${t.participantCode}: <strong style="color:rgba(255,255,255,0.35);letter-spacing:0.1em">${esc(code)}</strong>`;
}

// ─── E01 · Boas-vindas ────────────────────────────────────────────────────────
export function tplWelcome({ name, code, sessionLink, locale = 'pt' }) {
  const t = getStrings(locale);
  return {
    subject: t.e01subject,
    html: base(
      h1(t.e01h1) +
      para(t.e01para(esc(name))) +
      codeBlock(code, locale) +
      btn(t.e01btn, sessionLink),
      footerCode(code, locale),
      locale
    ),
  };
}

// ─── E02 · Lembrete de código ─────────────────────────────────────────────────
export function tplCodeReminder({ name, code, sessionLink, locale = 'pt' }) {
  const t = getStrings(locale);
  return {
    subject: t.e02subject,
    html: base(
      h1(t.e02h1) +
      para(t.e02para(esc(name))) +
      codeBlock(code, locale) +
      btn(t.e02btn, sessionLink),
      footerCode(code, locale),
      locale
    ),
  };
}

// ─── E03 · Link Sessão 2 ─────────────────────────────────────────────────────
export function tplSessionLink({ code, studyLink, locale = 'pt' }) {
  const t = getStrings(locale);
  return {
    subject: t.e03subject,
    html: base(
      h1(t.e03h1) +
      para(t.e03para) +
      btn(t.e03btn, studyLink),
      footerCode(code, locale),
      locale
    ),
  };
}

// ─── E04/E05 · Sessão N autorizada ───────────────────────────────────────────
export function tplSessionUnlocked({ name, session, studyLink, locale = 'pt' }) {
  const t = getStrings(locale);
  const s = Number(session) === 3 ? 3 : 2;
  return {
    subject: t.e04subject(s),
    html: base(
      h1(t.e04h1(s)) +
      para(t.e04para(esc(name), s)) +
      btn(t.e04btn(s), studyLink),
      '',
      locale
    ),
  };
}

// ─── E06 · Código /conect por email ──────────────────────────────────────────
export function tplConnectCode({ name, connectCode, locale = 'pt' }) {
  const t = getStrings(locale);
  const conect = `${PLATFORM_URL}/conect`;
  return {
    subject: t.e06subject,
    html: base(
      h1(t.e06h1) +
      para(t.e06para(esc(name), esc(conect))) +
      codeBlock(connectCode, locale),
      '',
      locale
    ),
  };
}

// ─── E07 · Pesquisa concluída ─────────────────────────────────────────────────
export function tplResearchComplete({ name, locale = 'pt' }) {
  const t = getStrings(locale);
  return {
    subject: t.e07subject,
    html: base(
      h1(t.e07h1) +
      para(t.e07para1(esc(name))) +
      para(t.e07para2),
      '',
      locale
    ),
  };
}

// ─── E08 · Convite de indicação ───────────────────────────────────────────────
export function tplReferralInvite({ referrerName, inviteLink, locale = 'pt' }) {
  const t = getStrings(locale);
  return {
    subject: t.e08subject(esc(referrerName)),
    html: base(
      h1(t.e08h1(esc(referrerName))) +
      para(t.e08para(esc(referrerName))) +
      btn(t.e08btn, inviteLink),
      '',
      locale
    ),
  };
}

// ─── E09 · Confirmação de indicação ──────────────────────────────────────────
export function tplReferralConfirmed({ referrerName, newParticipantName, locale = 'pt' }) {
  const t = getStrings(locale);
  return {
    subject: t.e09subject,
    html: base(
      h1(t.e09h1) +
      para(t.e09para(esc(referrerName), esc(newParticipantName))),
      '',
      locale
    ),
  };
}

// ─── E10 · Confirmação da waitlist ───────────────────────────────────────────
export function tplWaitlistConfirm({ locale = 'pt' } = {}) {
  const t = getStrings(locale);
  return {
    subject: t.e10subject,
    html: base(
      h1(t.e10h1) +
      para(t.e10para),
      '',
      locale
    ),
  };
}

// ─── E11 · Lançamento do OMMΩ ─────────────────────────────────────────────────
export function tplProductLaunch({ launchUrl, locale = 'pt' }) {
  const t = getStrings(locale);
  return {
    subject: t.e11subject,
    html: base(
      h1(t.e11h1) +
      para(t.e11para) +
      btn(t.e11btn, launchUrl),
      '',
      locale
    ),
  };
}

// ─── E14 · Lembrete de sessão ─────────────────────────────────────────────────
export function tplSessionReminder({ name, session, studyLink, locale = 'pt' }) {
  const t = getStrings(locale);
  const s = Number(session) === 3 ? 3 : 2;
  return {
    subject: t.e14subject(s),
    html: base(
      h1(t.e14h1(s)) +
      para(t.e14para(esc(name), s)) +
      btn(t.e14btn(s), studyLink),
      '',
      locale
    ),
  };
}

// ─── E15 · Alerta admin (texto plano, sem i18n) ───────────────────────────────
export function tplAdminAlert({ event, participantCode, details }) {
  return {
    subject: `[Xcorphion Alert] ${event} — ${participantCode}`,
    html: `<pre style="font-family:monospace;font-size:13px;color:#ccc;background:#111;padding:20px;border-radius:8px;white-space:pre-wrap">[XCORPHION ALERT]
Evento: ${esc(event)}
Participante: ${esc(participantCode)}
Detalhes: ${esc(details)}
Timestamp: ${new Date().toISOString()}
</pre>`,
  };
}
