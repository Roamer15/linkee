export function generateCode(length = 6, charset = 'alphanumeric') {
    const charsets = {
      alphanumeric: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Excluded easily confused chars
      numeric: '0123456789',
      alphabetic: 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    };
    
    const chars = charsets[charset] || charsets.alphanumeric;
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(byte => chars[byte % chars.length])
      .join('');
  }
