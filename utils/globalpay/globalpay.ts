export const GLOBALPAY_BASE_URL = process.env.GLOBALPAY_BASE_URL || "https://api.globalpay.ng"

export function globalpayHeaders () {
    const secret_key = process.env.GLOBALPAY_SECRET_KEY

    if(!secret_key){
        throw new Error("missing GLOBALPAY_SECRET_KEY environment variable")
    }


    return {
        Authorization: `Bearer ${secret_key}`,
        "Content-Type": "application/json"
    }
}