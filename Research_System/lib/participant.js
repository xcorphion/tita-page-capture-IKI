import crypto from 'crypto';

export function hashParticipantId(code) {
    const salt = process.env.PARTICIPANT_SALT || 'titã-somatic-transformer-2026';
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

export function extractIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.socket?.remoteAddress
        || 'unknown';
}
