"use server"


interface FezTokenCache {
    authToken: string
    secretKey: string
    expiresAt: number
}


let tokenCache: FezTokenCache | null = null


const FEZ_BASE_URL = process.env.NODE_ENV === "production" ? "https://api.fezdelivery.co" : "https://apisandbox.fezdelivery.co"

console.log("fez base url", FEZ_BASE_URL)


async function getFezCredentials(): Promise<{
    authToken: string,
    secretKey: string
}>{
        const now = Date.now()
        const sixtySeconds = 60 * 1000


        if (tokenCache && tokenCache.expiresAt - now > sixtySeconds){
            return {
                authToken: tokenCache.authToken,
                secretKey: tokenCache.secretKey
            }
        }

         const authResponse = await fetch(`${FEZ_BASE_URL}/v1/user/authenticate`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                user_id: process.env.FEZ_USER_ID!,
                password: process.env.FEZ_PASSWORD!
            })
        })


        const authData = await authResponse.json()


        if(!authResponse.ok || authData.status !== "Success"){
            throw new Error(authData.description || "Authentication Failed")
        }

        const authToken = authData.authDetails.authToken
        const secretKey = authData.orgDetails["secret-key"]

        tokenCache = {
            authToken,
            secretKey,
            expiresAt: now + 55 * 60 * 1000
        }


        return {authToken, secretKey}
}


    
export async function getDeliveryQuote(state: string, lga: string, weight = 2) {
    try{

        const {authToken, secretKey}  = await getFezCredentials()

        
        
        

        const response = await fetch(`${FEZ_BASE_URL}/v1/order/cost`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "secret-key": secretKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                state,
                weight
            })
        })

        const data = await response.json()

        if(!response.ok || data.status !== "Success"){
            throw new Error(data.description || "Failed to fetch shipping quote")
        }


        return{
            success: true,
            price: data.totalCost,
            breakdown: {
                baseCost: data.cost?.cost ?? 0,
                vat: data.vat?.vatAmount ?? 0
            }
        }
    }catch(error: any){
        console.error("Logistics Error:", error)
        return {success: false, error: error.message}
    }
}