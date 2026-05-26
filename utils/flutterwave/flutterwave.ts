const TOKEN_URL ="https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token"



// export const FLW_BASE_URL = process.env.NODE_ENV === "production" 
// ? "https://api.flutterwave.com" : "https://developersandbox-api.flutterwave.com"

const isProd = process.env.NODE_ENV === 'production';

export const FLW_BASE_URL = isProd
  ? 'https://f4bexperience.flutterwave.com'
  : 'https://developersandbox-api.flutterwave.com'


interface TokenCache {
    accessToken: string
    expiresAt: number
}

let tokenCache: TokenCache | null = null


export async function getFlutterwaveToken(): Promise<string> {
    const now = Date.now()
    const sixtySeconds = 60 * 1000


    const isValidToken = tokenCache !== null && tokenCache.expiresAt - now > sixtySeconds

    if(isValidToken){
        return tokenCache!.accessToken
    }

    const clientId = process.env.FLW_CLIENT_ID
    const clientSecret = process.env.FLW_CLIENT_SECRET


    if(!clientId || !clientSecret){
        throw new Error( "Missing FLW_CLIENT_ID or FLW_CLIENT_SECRET environment variables.")
    }

    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials"
    })

    const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString()
    })

    if (!response.ok){
        const errorText = await response.text()
        throw new Error(`Flutterwave token fetch failed: ${errorText}`)
    }

    const data = await response.json()

    if(!data.access_token){
        throw new Error("Flutterwave token response missing access_token")
    }


    tokenCache = {
        accessToken:  data.access_token,
        expiresAt: now + data.expires_in * 1000
    }

    return tokenCache.accessToken 
}
