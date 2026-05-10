const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online';

// ─── Base layout ──────────────────────────────────────────────────────────────
function base(content, footerNote = '') {
  return `<!DOCTYPE html>
<html lang="pt-br">
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
            <br><br>Se você não solicitou este e-mail, ignore-o.
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

function btn(label, href) {
  return `<tr><td style="padding-bottom:36px">
    <a href="${href}" style="display:inline-block;background:#8B0000;color:#ffffff;padding:13px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-size:14px;font-weight:500">${label} →</a>
  </td></tr>`;
}

function codeBlock(code) {
  return `<tr><td style="padding-bottom:32px">
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:20px 24px;text-align:center">
      <p style="font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px">Seu código de acesso</p>
      <span style="font-family:sans-serif;font-size:34px;font-weight:700;color:#ffffff;letter-spacing:0.2em">${code}</span>
    </div>
  </td></tr>`;
}

// ─── E01 · Boas-vindas ────────────────────────────────────────────────────────
export function tplWelcome({ name, code, sessionLink }) {
  return base(
    h1('Bem-vindo à pesquisa OMMΩ.') +
    para(`Olá, ${name}. Seu perfil foi criado com sucesso. Guarde o código abaixo — ele é o seu acesso exclusivo a todas as sessões.`) +
    codeBlock(code) +
    btn('Iniciar Sessão 1', sessionLink),
    `Código do participante: <strong style="color:rgba(255,255,255,0.35);letter-spacing:0.1em">${code}</strong>`
  );
}

// ─── E02 · Lembrete de código ─────────────────────────────────────────────────
export function tplCodeReminder({ name, code, sessionLink }) {
  return base(
    h1('Seu código de acesso.') +
    para(`Olá, ${name}. Você solicitou o lembrete do seu código de participante.`) +
    codeBlock(code) +
    btn('Acessar pesquisa', sessionLink),
    `Código do participante: <strong style="color:rgba(255,255,255,0.35);letter-spacing:0.1em">${code}</strong>`
  );
}

// ─── E03 · Link Sessão 2 (refactor do send-link.js existente) ────────────────
export function tplSessionLink({ code, studyLink }) {
  return base(
    h1('Sessão 1 concluída.') +
    para('Obrigado pela participação. Quando a Sessão 2 abrir, você receberá uma notificação neste endereço.<br><br>Guarde o link abaixo — ele é o seu acesso exclusivo à área de pesquisa:') +
    btn('Acessar área de pesquisa', studyLink),
    `Código do participante: <strong style="color:rgba(255,255,255,0.35);letter-spacing:0.1em">${code}</strong>`
  );
}

// ─── E04/E05 · Sessão N autorizada ───────────────────────────────────────────
export function tplSessionUnlocked({ name, session, studyLink }) {
  return base(
    h1(`Sessão ${session} liberada.`) +
    para(`Olá, ${name}. Sua Sessão ${session} foi autorizada e está disponível agora. Acesse a pesquisa pelo link abaixo.`) +
    btn(`Iniciar Sessão ${session}`, studyLink)
  );
}

// ─── E06 · Código /conect por email ──────────────────────────────────────────
export function tplConnectCode({ name, connectCode }) {
  const conect = `${PLATFORM_URL}/conect`;
  return base(
    h1('Acesse em outro dispositivo.') +
    para(`Olá, ${name}. Seu equipamento atual não é válido para a pesquisa. Abra <strong style="color:rgba(255,255,255,0.7)">${conect}</strong> em um computador ou notebook e insira o código abaixo.`) +
    codeBlock(connectCode)
  );
}

// ─── E07 · Pesquisa concluída ─────────────────────────────────────────────────
export function tplResearchComplete({ name }) {
  return base(
    h1('Pesquisa concluída.') +
    para(`Olá, ${name}. Você completou as 3 sessões da pesquisa OMMΩ. Obrigado pela sua contribuição — seus dados são parte fundamental do desenvolvimento do sistema.`) +
    para('Fique de olho no seu e-mail: em breve compartilharemos os resultados do estudo com todos os participantes.')
  );
}

// ─── E08 · Convite de indicação ───────────────────────────────────────────────
export function tplReferralInvite({ referrerName, inviteLink }) {
  return base(
    h1(`${referrerName} te convidou.`) +
    para(`<strong style="color:rgba(255,255,255,0.8)">${referrerName}</strong> convidou você para participar da pesquisa OMMΩ da Xcorphion — um estudo sobre o ritmo somático da digitação e inteligência artificial.<br><br>A participação leva entre 8 e 15 minutos e requer teclado físico.`) +
    btn('Aceitar convite e participar', inviteLink)
  );
}

// ─── E09 · Confirmação de indicação (para quem indicou) ──────────────────────
export function tplReferralConfirmed({ referrerName, newParticipantName }) {
  return base(
    h1('Seu convite foi aceito.') +
    para(`Olá, ${referrerName}. <strong style="color:rgba(255,255,255,0.8)">${newParticipantName}</strong> usou seu convite e entrou na pesquisa OMMΩ. Obrigado por expandir a nossa base de dados.`)
  );
}

// ─── E10 · Confirmação da waitlist ───────────────────────────────────────────
export function tplWaitlistConfirm() {
  return base(
    h1('Você está na lista.') +
    para('Recebemos sua inscrição na lista de espera do OMMΩ. Quando as próximas sessões abrirem, você será o primeiro a saber.<br><br>Não precisa fazer nada agora.')
  );
}

// ─── E11 · Lançamento do OMMΩ ─────────────────────────────────────────────────
export function tplProductLaunch({ launchUrl }) {
  return base(
    h1('O OMMΩ chegou.') +
    para('A plataforma que aprende com o ritmo do seu teclado está disponível. Você foi um dos primeiros a se inscrever na lista de espera — agora é a sua vez.') +
    btn('Acessar o OMMΩ', launchUrl)
  );
}

// ─── E14 · Lembrete de sessão ─────────────────────────────────────────────────
export function tplSessionReminder({ name, session, studyLink }) {
  return base(
    h1(`Sua Sessão ${session} ainda está disponível.`) +
    para(`Olá, ${name}. Sua Sessão ${session} foi liberada há alguns dias e ainda não foi iniciada. Quando você estiver pronto, o link abaixo está te esperando.`) +
    btn(`Acessar Sessão ${session}`, studyLink)
  );
}

// ─── E15 · Alerta admin (texto plano, rápido) ─────────────────────────────────
export function tplAdminAlert({ event, participantCode, details }) {
  return `<pre style="font-family:monospace;font-size:13px;color:#ccc;background:#111;padding:20px;border-radius:8px;white-space:pre-wrap">[XCORPHION ALERT]
Evento: ${event}
Participante: ${participantCode}
Detalhes: ${details}
Timestamp: ${new Date().toISOString()}
</pre>`;
}
