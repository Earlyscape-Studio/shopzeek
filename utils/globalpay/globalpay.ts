export const GLOBALPAY_BASE_URL = process.env.GLOBALPAY_BASE_URL

export function globalpayHeaders () {
    const publicKey = process.env.GLOBALPAY_API_KEY

    if(!publicKey){
        throw new Error("missing GLOBALPAY_API_KEY environment variable")
    }


    return {
        apiKey: publicKey,
        language: "en",
        "Content-Type": "application/json"
    }
}