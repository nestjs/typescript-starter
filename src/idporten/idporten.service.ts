import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../token/token.service';
import { SignJWT, JWTPayload } from 'jose'
import { createPrivateKey } from 'node:crypto'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { normalizeAddress } from '../common/utils/address';

type GetTokenOpts = {
    resource?: string[]
    consumerOrg?: string
    lifetimeSec?: number
}

@Injectable()
export class IdportenService {
    private readonly redirectUrl: string
    private readonly clientId: string
    private readonly secret: string

    constructor(private readonly config: ConfigService, private readonly tokenService: TokenService) {
        this.redirectUrl = this.config.get<string>('DIGDIR_REDIRECT') ?? ''
        this.clientId = this.config.get<string>('DIGDIR_CLIENTID') ?? ''
        this.secret = this.config.get<string>('DIGDIR_SECRET') ?? ''
    }

    async login(orgNumber: string): Promise<string> {
        const state = { orgNumber }
        const data = btoa(JSON.stringify(state));
        const codeVerifier = 'srpzt1jeQggq9Ns9Cw2YZeLQAH0usgj37XpnuWC0vNY'
        const codeChallenge = await this.generateCodeChallenge(codeVerifier)

        return this.generateLink(data, codeChallenge)
    }

    async getUser(code: string): Promise<string> {
        const codeVerifier = 'srpzt1jeQggq9Ns9Cw2YZeLQAH0usgj37XpnuWC0vNY'
        const auth = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.secret)
        }
        let data = {
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: this.redirectUrl,
            code_verifier: codeVerifier
        }

        const jwt = await  axios.post("https://idporten.no/token", data, { headers: auth })
        if (jwt.data.error_description !== null) {
            console.log(jwt.data.error_description)
        }

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + jwt.data.access_token
        }

        const userinfo = await axios.get("https://idporten.no/userinfo", { headers })

        const personHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt.data.access_token
        }

        const person = await axios.get("https://kontaktregisteret.no/rest/v2/person", { headers: personHeaders })
        const randomString = await this.tokenService.createToken()
        const result = {
            code: randomString,
            pid: btoa(userinfo.data.pid),
            email: btoa(person.data.kontaktinformasjon.epostadresse ?? ''),
            phone: btoa(person.data.kontaktinformasjon.mobiltelefonnummer ?? ''),
        }

        return btoa(JSON.stringify(result))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')
    }

    async generateLogin(id: string, token: string): Promise<string> {
        const state = { id, token }
        const data = btoa(JSON.stringify(state));
        const codeVerifier = 'srpzt1jeQggq9Ns9Cw2YZeLQAH0usgj37XpnuWC0vNY'
        const codeChallenge = await this.generateCodeChallenge(codeVerifier)

        return this.generateLink(data, codeChallenge)
    }

    async checkName(pid: string, name: string): Promise<any> {
        const maskinJwt = await this.getAccessToken(['folkeregister:deling/privatutenfolkeregisteridentifikator'])
        const params = {
            navn: name,
            identifikasjonsnummer: pid,
        }

        return await this.sendFolkeRegister(maskinJwt.access_token, params)
    }

    async checkAddress(name: string, addressOne: string, addressTwo: string): Promise<any> {
        const maskinJwt = await this.getAccessToken(['folkeregister:deling/privatutenfolkeregisteridentifikator'])
        const address = normalizeAddress(addressOne, addressTwo)
        const params = {
            navn: name,
            adressenavn: address.street,
            husnummer: address.houseNumber
        }

        console.log("checkAddress", params)

        try {
            return await this.sendFolkeRegister(maskinJwt.access_token, params)
        } catch (error) {
            console.log("checkAddress error:", error.response?.data.message ?? error.message)
            throw error
        }
    }

    private async generateCodeChallenge(verifier: string): Promise<string>  {
        const encoder = new TextEncoder()
        const data = encoder.encode(verifier)
        const digest = await crypto.subtle.digest('SHA-256', data)

        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')
    }

    private generateLink(data: string, codeChallenge: string): string {
        return `https://login.idporten.no/authorize?` +
        `ui_locales=nb&` +
        `scope=openid+profile+krr:user/kontaktinformasjon.read+folkeregister:deling/privatutenfolkeregisteridentifikator&` +
        `acr_values=idporten-loa-substantial&` +
        `response_type=code&` +
        `redirect_uri=${ this.redirectUrl }&` +
        `state=${ data }&` +
        `code_challenge_method=S256&` +
        `nonce=N7ji3mcjn0AsKvVhWHC695P6aD5v2rOVDbgQR0fkGeY&` +
        `client_id=${ this.clientId }&` +
        `code_challenge=${ codeChallenge }`
    }

    private async buildClientAssertion(scopes: string[], opts: GetTokenOpts = {}): Promise<string> {
        const issuer = this.config.get<string>('MASKINPORTEN_ISSUER')!
        const clientId = this.config.get<string>('MASKINPORTEN_CLIENT_ID')!
        const keyId = this.config.get<string>('MASKINPORTEN_KEY_ID')!
        const raw = this.config.get<string>('MASKINPORTEN_PRIVATE_KEY_PATH')!
        const keyPath = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw)
        const lifetime = Math.min(opts.lifetimeSec ?? 120, 120)
        const alg = 'RS256'
        const pem = await fs.readFile(keyPath, 'utf8')
        const privateKey = createPrivateKey({ key: pem, format: 'pem' })

        const now = Math.floor(Date.now() / 1000)

        const payload: JWTPayload = {
            iss: clientId,
            aud: issuer,
            iat: now,
            exp: now + lifetime,
            jti: uuidv4(),
            scope: scopes.join(' '),
            ...(opts.resource ? { resource: opts.resource } : {}),
            ...(opts.consumerOrg ? { consumer_org: opts.consumerOrg } : {}),
        }
const { SignJWT } = await import('jose')
        return await new SignJWT(payload)
            .setProtectedHeader({ alg, kid: keyId })
            .sign(privateKey)
    }

    async getAccessToken(scopes: string[], opts: GetTokenOpts = {}) {
        const tokenUrl = this.config.get<string>('MASKINPORTEN_TOKEN_URL')!
        const assertion = await this.buildClientAssertion(scopes, opts)

        const body = new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion,
        })

        const { data } = await axios.post(tokenUrl, body.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10000,
        })

        return data
    }

    private async sendFolkeRegister(token: string, params: any = {}, type: string = 'folkeregisteret/api/privatutenfolkeregisteridentifikator'): Promise<any> {
        const url = this.config.get<string>('FOLKEREGISTER_URL')!
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }

        const { data } = await axios.get(`${url}/${type}/v1/personer/entydigsoek`, { headers, params, })

        return data
    }
}