export interface EncryptedCardData {
    nonce: string
    encrypted_card_number: string
    encrypted_expiry_month: string
    encrypted_expiry_year: string
    encrypted_cvv: string
}


function generateNonce (): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const values = crypto.getRandomValues(new Uint8Array(12))
    return Array.from(values).map((v) => chars[v % chars.length]).join("") 
}


async function encryptField(
    plaintext: string,
    base64key: string,
    nonce: string
): Promise<string>{
    const keyBytes = Uint8Array.from(atob(base64key), (c) => c.charCodeAt(0))
    const iv = new TextEncoder().encode(nonce)



    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        {name: "AES-GCM"},
        false,
        ["encrypt"]
    )


    const encrypted = await crypto.subtle.encrypt(
        {name: "AES-GCM", iv},
        cryptoKey,
        new TextEncoder().encode(plaintext)
    )

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
}



export async function encryptCardData(card: {
    cardNumber: string,
    expiryMonth: string
    expiryYear: string
    cvv: string
}): Promise<EncryptedCardData> {
    const encryptionKey = process.env.NEXT_PUBLIC_FLW_ENCRYPTION_KEY

    if (!encryptionKey){
        throw new Error(
            "NEXT_PUBLIC_FLW_ENCRYPTION_KEY is not set. Add it to your .env file"
        )
    }

    const nonce = generateNonce()

    const [
        encrypted_card_number,
        encrypted_expiry_month,
        encrypted_expiry_year,
        encrypted_cvv,
    ] = await Promise.all([
        encryptField(card.cardNumber.replace(/\s/g, ""), encryptionKey, nonce),
        encryptField(card.expiryMonth, encryptionKey, nonce),
        encryptField(card.expiryYear, encryptionKey, nonce),
        encryptField(card.cvv, encryptionKey, nonce),
        ])


        return {
            nonce,
            encrypted_card_number,
            encrypted_expiry_month,
            encrypted_expiry_year,
            encrypted_cvv
        }
}