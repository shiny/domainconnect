import crypto from 'node:crypto'
export function createKeyPair(type: "rsa", options?: crypto.RSAKeyPairKeyObjectOptions) {
    options ??= {
        modulusLength: 2048,
    }
    const { publicKey, privateKey } = crypto.generateKeyPairSync(type, options)
    
    return {
        publicKey: publicKey.export({ type: 'pkcs1', format: 'pem' }),
        privateKey: privateKey.export({ type: 'pkcs1', format: 'pem' })
    }
}

/**
 * 
 * Per RFC 1035 section 2.3. 4, TXT records are limited to 255 characters.
 * so we need to split the public key into chunks of characters
 * 
 * please refer to https://github.com/Domain-Connect/spec/blob/master/Domain%20Connect%20Spec%20Draft.adoc#digitally-sign-requests
 * @param publicKey 
 * @returns 
 */
export function splitToDnsTextRecords(publicKey: string): string[] {
    const publicKeyInPemStr = publicKey
    .replace('-----BEGIN RSA PUBLIC KEY-----', '')
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END RSA PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    
    const content = publicKeyInPemStr.split("\n").map(line => line.trim()).join('')
    
    // Chunk the content into segments of 200 characters each
    const chunks: string[] = [];
    const chunkSize = 200;
    
    for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.substring(i, i + chunkSize));
    }
    
    return chunks.map((chunk, index) => `p=${index+1},a=RS256,d=${chunk}`);
}
