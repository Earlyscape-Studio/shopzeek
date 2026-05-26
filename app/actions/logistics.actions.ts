"use server"

interface FezTokenCache {
    authToken: string
    secretKey: string
    expiresAt: number
}

let tokenCache: FezTokenCache | null = null

// const isProd = process.env.NODE_ENV === "production" // fix: was `proces`



const FEZ_BASE_URL = "https://api.fezdelivery.co"



async function getFezCredentials(): Promise<{
    authToken: string
    secretKey: string
}> {
    const now = Date.now()
    const sixtySeconds = 60 * 1000

    if (tokenCache && tokenCache.expiresAt - now > sixtySeconds) {
        return {
            authToken: tokenCache.authToken,
            secretKey: tokenCache.secretKey,
        }
    }

    const authResponse = await fetch(`${FEZ_BASE_URL}/v1/user/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: process.env.FEZ_USER_ID,
            password: process.env.FEZ_PASSWORD,
        }),
    })

    const authData = await authResponse.json()

    // console.log("response", authData)
    // console.log("base url", FEZ_BASE_URL)
    // console.log("usr id", process.env.FEZ_USER_ID)
    // console.log("passwrd", process.env.FEZ_PASSWORD)

    if (!authResponse.ok || authData.status !== "Success") {
        throw new Error(authData.description || "Authentication Failed")
    }

    const authToken: string = authData.authDetails.authToken
    const secretKey: string = authData.orgDetails["secret-key"]

    // fix: parse actual expiry from the API response instead of hardcoding 55 minutes.
    // expireToken is returned as "YYYY-MM-DD HH:MM:SS" (UTC).
    // We subtract 60 seconds as a safety buffer before treating the token as expired.
    const expireToken: string = authData.authDetails.expireToken
    const expiresAt = new Date(expireToken).getTime() - sixtySeconds

    tokenCache = { authToken, secretKey, expiresAt }

    return { authToken, secretKey }
}


export async function getDeliveryQuote(
    state: string,
    weight = 2
) {
    try {
        const { authToken, secretKey } = await getFezCredentials()

        // console.log("secret-key", secretKey)
        // console.log("auth Token", authToken)
        // console.log("weight", weight)
        // console.log("state", state)
        


        const response = await fetch(`${FEZ_BASE_URL}/v1/order/cost`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
                "secret-key": secretKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ state, weight }),
        })

        console.log("response", response)

        const data = await response.json()

        if (!response.ok || data.status !== "Success") {
            throw new Error(data.description || "Failed to fetch shipping quote")
        }

        return {
            success: true,
            price: data.totalCost,
            breakdown: {
                baseCost: data.cost?.cost ?? 0,
                vat: data.vat?.vatAmount ?? 0,
            },
        }
    } catch (error: unknown) { // fix: was `any`
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error("Logistics Error:", message)
        return { success: false, error: message }
    }
}