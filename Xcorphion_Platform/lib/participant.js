import crypto from 'crypto';
import { extractIp as _extractIp } from './security';

export function hashParticipantId(code) {
    const salt = process.env.PARTICIPANT_SALT;
    if (!salt) throw new Error('PARTICIPANT_SALT não configurado.');
    if (typeof code !== 'string' || !code) throw new Error('participant_code inválido.');
    return crypto.createHash('sha256').update(code + salt).digest('hex');
}

export function hashFingerprint(profile) {
    if (!profile) return null;
    const key = [
        profile.userAgent || '',
        profile.platform || '',
        profile.language || '',
        profile.timezone || '',
        `${profile.screen?.w ?? ''}x${profile.screen?.h ?? ''}`,
    ].join('|');
    return crypto.createHash('sha256').update(key).digest('hex');
}

export const extractIp = _extractIp;
