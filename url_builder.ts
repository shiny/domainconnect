import crypto from 'node:crypto'

export interface BuildSyncTemplateUrlQueryStringOptions {
    privateKey: string;
    domain: string;
    host?: string;
    state?: string;
    [key: string]: string | undefined;
    redirect_uri?: string;
}
export function buildSyncTemplateUrlQueryString(params: BuildSyncTemplateUrlQueryStringOptions): string {
    const defaults = {
        key: '_dcpubkeyv1',
        // a random number to prevent replay attacks
        // you can set it to any value you want if you need the state params
        state: Math.ceil(Math.random() * 1000000).toString()
    }
    const qs = new URLSearchParams(defaults)
    // keys should not be included in the query string
    const keysToSkip = ['privateKey', 'sig']
    Object.entries(params).forEach(([key, value]) => {
        if (value && !keysToSkip.includes(key)) {
            qs.set(key, value)
        }
    })
    const finalQueryString = qs.toString()
    const signer = crypto.createSign('sha256');
    signer.update(finalQueryString)
    signer.end();
    const signature = signer.sign(params.privateKey)
    const buff = Buffer.from(signature);
    const base64data = buff.toString('base64');
    return finalQueryString + '&sig=' + encodeURIComponent(base64data)
}

export interface SyncTemplateUrlOptions {
    urlSyncUX: string;
    providerId: string;
    serviceId: string;
    queryString?: string;
}

export function buildSyncTemplateUrl(params: SyncTemplateUrlOptions): string {
    return `${params.urlSyncUX}/v2/domainTemplates/providers/${params.providerId}/services/${params.serviceId}/apply?` + (params.queryString || '')
}
