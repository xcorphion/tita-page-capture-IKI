// Single source of truth for all participant and session state machine values.
// Handlers must import from here — never use magic strings for status fields.

// Session document lifecycle (sessions collection):
//   'started' → session/start creates it  →  'completed' → session/end closes it
export const SESSION_DOC_STATUS = Object.freeze({
  STARTED:   'started',
  COMPLETED: 'completed',
});

export const PARTICIPANT_STATUS = Object.freeze({
  ATIVO:     'ATIVO',
  INATIVO:   'INATIVO',   // auto-set when engagement_genuine = false
  BLOQUEADO: 'BLOQUEADO', // admin-set (suspicious activity, manual block)
});

// Session lifecycle (per session slot):
//   AGUARDANDO → LIBERADA → EM_ANDAMENTO → CONCLUIDA
//   Any slot → BLOQUEADA (terminal, set by disengagement or admin)
export const SESSION_STATUS = Object.freeze({
  AGUARDANDO:   'AGUARDANDO',
  LIBERADA:     'LIBERADA',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  CONCLUIDA:    'CONCLUIDA',
  BLOQUEADA:    'BLOQUEADA',
});

// Canonical participant document factory.
// All fields defined here — handlers must not add ad-hoc fields at insert time.
//
// source values:
//   'organic'  — participant signed up directly via /study (no referrer)
//   'referrer' — participant was invited by another participant (referrer flow, M3)
//
// connect_code    — 6-char alphanumeric, used by /conect for cross-device session resume
// respondent_number — sequential integer (atomic counter), for participant-facing display
export function createParticipantDoc({
  participant_id,
  participant_code,
  participant_name,
  referrer_name,
  source = 'organic',
  connect_code = null,
  respondent_number = null,
  contact_email = null,
  locale = 'pt',
}) {
  return {
    participant_id,
    participant_code,
    participant_name,
    referrer_name,
    connect_code,
    respondent_number,
    contact_email,
    locale,
    status:               PARTICIPANT_STATUS.ATIVO,
    session_1_status:     SESSION_STATUS.LIBERADA,
    session_2_status:     SESSION_STATUS.AGUARDANDO,
    session_3_status:     SESSION_STATUS.AGUARDANDO,
    session_1_engagement: null,
    session_2_engagement: null,
    session_3_engagement: null,
    admin_authorized_s2:  false,
    admin_authorized_s3:  false,
    sessions_completed:   0,
    onboarding_complete:  false,
    source,
    created_at:           new Date(),
  };
}
