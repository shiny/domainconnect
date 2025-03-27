# Domain Connect Library

Currently only contains the tyepscript source code, and only tested in bun.
## Installation

```bash
bun i domainconnect
```

## Quick Start

For example, you want to set a DNS record `link.netcup.gifts` to U301 URL Shortener.

```typescript
import {
    discoverDomainConnectSettings,
    buildSyncTemplateUrl,
    buildSyncTemplateUrlQueryString
} from "domainconnect"

const userInputDomain = 'netcup.gifts'
const userInputSubdomain = 'link'
const cnameVerificationPrefix = '<cname_verification_prefix_string>'

const settings = await discoverDomainConnectSettings(userInputDomain)

if (!settings || !settings.urlSyncUX) {
    throw new Error('Domain is not managed by cloudflare')
}
const templateUrl = buildSyncTemplateUrl({
    urlSyncUX: settings.urlSyncUX,
    providerId: 'u301.com',
    serviceId: 'bender'
})
// read private key from database or file
// const privateKey = await Bun.file('./cert/private_key.pem').text()
const queryString = buildSyncTemplateUrlQueryString({
    privateKey,
    domain: userInputDomain,
    host: userInputSubdomain,
    cname: cnameVerificationPrefix
})
console.log(templateUrl + queryString)
```
The final URL be like: `https://dash.cloudflare.com/domainconnect/v2/domainTemplates/providers/u301.com/services/bender/apply?key=_dcpubkeyv1&state=750148&domain=netcup.gifts&host=link&cname=%3Ccname_verification_prefix_string%3E&sig=gLFPKleHGci67bj9%2BqPO9Oo5sS2jokt9npescL%2Fc%2BISNdfm0jHFaxLjxfLf17QJ%2BxqGkRRpPpRwp7fJRi9xrZ%2BY7Xxhdmb4OS%2FrYuUFOpzpA0XMpfFB45RWEX3Pg2HAkekRqKqUsgxloASFL%2BuX4hJqGvyB9LZnMGRaO3m2ZxALQfrZrn4kEAZiaZFUSdEWvem6OiGrGpeDttlAnPztHgQ42Vfg175shgH49Bt%2F%2B66XAsvaPbiBLFeDJEgHDlbi7pKzuDHQQsTjxAxC91%2FAq9u9H%2Fx2ABaD1mfa4vBgq2l00P2n32UT276kf1zu3gtpqYSMTSkCmvoCYH0R6ay%2F3aQ%3D%3D`

Redirect to the URL and let user authorize it.

![https://img.netcup.gifts/blog/202503/xNZr3F.jpg](https://img.netcup.gifts/blog/202503/xNZr3F.jpg)

## Utilities

discoverDomainConnectSettings(domain: string)
Looks up the domain connect settings for the specified domain, for example:
```typescript
const settings = await discoverDomainConnectSettings('netcup.gifts')
/**
 Settings be like
{
  providerId: "cloudflare.com",
  providerName: "cloudflare",
  providerDisplayName: "Cloudflare",
  urlSyncUX: "https://dash.cloudflare.com/domainconnect",
  urlAPI: "https://api.cloudflare.com/client/v4/dns/domainconnect",
}
 */
```

Returns null if the domain is not hosted on Cloudflare. Currently only supports Cloudflare.


### buildSyncTemplateUrl

```typescript
if (!settings.urlSyncUX) {
    throw new Error('Domain is not managed by cloudflare')
}
const templateUrl = buildSyncTemplateUrl({
    urlSyncUX: settings.urlSyncUX,
    providerId: 'u301.com',
    serviceId: 'bender'
})
// templateUrl be like: https://dash.cloudflare.com/domainconnect/v2/domainTemplates/providers/u301.com/services/bender/apply?
```

### buildSyncTemplateUrlQueryString
Append the query string to the template URL.
```typescript
const queryString = buildSyncTemplateUrlQueryString({
    privateKey,
    domain: 'netcup.gifts',
    host: 'www'
})
```

### createKeyPair
Generate a RSA private key and public key.

```typescript
const { privateKey, publicKey } = await createKeyPair()
console.log(privateKey)
console.log(publicKey)
``` 

it equals to the command lines below
```bash
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private_key.pem -out public_key.pem 
```

### splitToDnsTextRecords
Split the public key into multiple DNS text records. `_dcpubkeyv1.example.com`
You can set txt records for each item.
```typescript
// publicKey is a string contains the public key -----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----
const records = splitToDnsTextRecords(publicKey)
console.log(records)
```


## License
MIT
