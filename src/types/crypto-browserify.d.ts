declare module 'crypto-browserify' {
  import { Hash, Hmac, Decipher, Cipher, Signer, Verify } from 'crypto';

  export const createHash: (algorithm: string) => Hash;
  export const createHmac: (algorithm: string, key: string | Buffer) => Hmac;
  export const createDecipheriv: (algorithm: string, key: string | Buffer, iv: string | Buffer) => Decipher;
  export const createCipheriv: (algorithm: string, key: string | Buffer, iv: string | Buffer) => Cipher;
  export const publicEncrypt: (publicKey: string | Buffer | { key: string | Buffer, padding?: number, oaepHash?: string, oaepLabel?: Buffer }, buffer: Buffer) => Buffer;
  export const privateDecrypt: (privateKey: string | Buffer | { key: string | Buffer, padding?: number, oaepHash?: string, oaepLabel?: Buffer }, buffer: Buffer) => Buffer;
  export const createSign: (algorithm: string) => Signer;
  export const createVerify: (algorithm: string) => Verify;
  export const constants: {
    RSA_PKCS1_PADDING: number;
    RSA_PKCS1_OAEP_PADDING: number;
  };
}
