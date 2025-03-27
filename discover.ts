import dns from 'node:dns/promises'
import { z } from 'zod'

export const availableProviders: string[] = [
    'cloudflare.com'
]
/**
 * @see https://github.com/Domain-Connect/spec/blob/master/Domain%20Connect%20Spec%20Draft.adoc#dns-provider-discovery
 */
export const dnsProviderDiscoverySettingsSchema = z.object({
    providerId: z.string(),
    providerName: z.string(),
    providerDisplayName: z.string().optional(),
    urlSyncUX: z.string().url().optional(),
    urlAsyncUX: z.string().url().optional(),
    urlAPI: z.string().url(),
    width: z.number().optional(),
    height: z.number().optional(),
    urlControlPanel: z.string().optional(),
    nameServers: z.array(z.string()).optional()
})

/**
 * Discover the domain connect settings for a domain
 * @param domain The domain to discover settings for
 * @param options Optional options
 * @param options.validateProvider Whether to validate the provider
 * @param options.fetchOptions Optional fetch options
 * @returns The settings for the domain or null if not found
 */
export async function discoverDomainConnectSettings(domain: string, options?: {
    validateProvider?: boolean,
    fetchOptions?: RequestInit
}) {
    const txtRecord = await dns.resolveTxt('_domainconnect.' + domain)
    const domainconnectUrl = txtRecord?.[0]?.[0];
    if (!domainconnectUrl || typeof domainconnectUrl !== 'string') {
        return null
    }

    const shouldValidateProvider = options?.validateProvider ?? true
    if (shouldValidateProvider) {
        const { hostname } = new URL('https://' + domainconnectUrl)
        const isProviderValid = availableProviders.some((provider) => {
            // check if the domain is exact match or is subdomain of provider
            return hostname === provider || hostname.endsWith(`.${provider}`)
        })
        if (!isProviderValid) {
            return null
        }
    }

    // use available providers to prevent attacks
    // e.g. get your server ip or cc attacks.
    const url = `https://${domainconnectUrl}/v2/${domain}/settings`
    const response = await fetch(url, options?.fetchOptions)
    const settings = await response.json()
    return dnsProviderDiscoverySettingsSchema.parse(settings)
}
