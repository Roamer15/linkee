import crypto from 'node:crypto'; // Make sure this is at the top of the file

export function generateCode(length = 6, charset = 'alphanumeric') {
    const charsets = {
        alphanumeric: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
        numeric: '0123456789',
        alphabetic: 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    };

    const chars = charsets[charset] || charsets.alphanumeric;
    const randomBytes = crypto.randomBytes(length);

    return Array.from(randomBytes)
        .map(byte => chars[byte % chars.length])
        .join('');
}
