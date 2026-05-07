import crypto from 'crypto';

export function hashParticipantId(code) {
    const salt = process.env.PARTICIPANT_SALT || 'titã-somatic-transformer-2026';
    return crypto.createHash('sha256').update(code + salt).digest('hex');
}
