


export type UserRole = "customer"| "admin";


export type OrderStatus = "pending" | "awaiting_payment" | "paid" | "fulfilled" | "cancelled"


export type DiscountType = "percentage" | "fixed"

export type PaymentProvider = "zenith_pay"


export type Profile = {
    id: string
    full_name: string | null
    role: UserRole
    avatar_url: string | null
    create_at: string
}


export type Product = {
    id: string
    name: string
    description: string | null
    price: number
    stock_count: number
    category: string | null
    brand: string | null
    slug: string | null
    image_urls: string[]
    is_published: boolean
    is_featured: boolean
    is_new: boolean
    deal_price: number | null
    deal_ends_at: string | null
    created_at: string
    updated_at: string
}


export type Order = {
    id: string
    user_id: string
    status: OrderStatus
    total_amount: number
    discount_amount: number
    payment_provider: PaymentProvider | null
    payment_reference: string | null
    coupon_id: string | null
    address_id: string | null
    created_at: string
}

export type OrderItem = {
    id: string
    order_id: string
    product_id: string
    quantity: number
    unit_price: number
    created_at: string
}


export type Address = {
    id: string
    user_id: string
    full_name: string
    phone: string
    address_line1: string
    address_line2: string | null
    city: string
    state: string
    country: string
    is_default: boolean
    created_at: string
}

export type Wishlist = {
    id: string
    user_id: string
    product_id: string
    created_at: string
}


export type Review = {
    id: string
    user_id: string
    product_id: string
    rating: number
    body: string | null
    created_at: string
}

export type Coupon = {
    id: string
    code: string
    discount_type: DiscountType
    discount_value: number
    expires_at: string | null
    max_uses: number | null
    used_count: number
    is_active: boolean
    created_at: string
}


export type BlogPost = {
    id: string;
    title: string;
    slug: string;
    content: string | null;
    cover_image_url: string | null;
    published_at: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}




export type InsertProduct = Omit<Product, "id" | "created_at" | "updated_at">

export type InsertOrder = Omit<Order, "id" | "created_at">

export type InsertOrderItem = Omit<OrderItem, "id" | "created_at">

export type InsertAddress = Omit<Address, "id" | "created_at">

export type InsertReview = Omit<Review, "id" | "created_at">

export type InsertCoupon = Omit<Coupon, "id" | "used_count" | "created_at">

export type InsertBlogPost = Omit<BlogPost, "id" | "created_at" | "updated_at">


export type UpdateProdcut = Partial<InsertProduct>

export type UpdateOrder = Partial<Omit<InsertOrder, "user_id">>

export type UpdateAddress = Partial<Omit<InsertAddress, "user_id">>

export type UpdateCoupon = Partial<InsertCoupon>

export type UpdateBlogPost = Partial<InsertBlogPost>





export type OrderItemWithProduct = OrderItem & {product: Pick<Product, "id" | "name" | "slug"| "image_urls">}

export type OrderWithDetails = Order & {
    profile: Pick<Profile, "id"| "full_name">
    address: Address | null
    order_items: OrderItemWithProduct[]
    coupon: Pick<Coupon, "code" | "discount_type" | "discount_value"> | null
}


export type WishListWithProduct = Wishlist & {product: Pick<Product, "id" | "name" | "price" | "image_urls" | "slug" | "stock_count">}

export type ProductWithReviews = Product & {reviews: (Review & {profile: Pick<Profile, "full_name" | "avatar_url">})[]}

export type RatingSummary = {
    average: number
    total: number
    break_down: Record<1 | 2 | 3 | 4 | 5, number>
}



// zenith pay types

export type ZenithPayDedicatedAccount = {
    account_number: string
    bank_name: string
    account_name: string
    reference: string
    customer: {
        id: string
        first_name: string
        last_name: string
        email: string
    }
}


export type ZenithWebhookPayload = {
    event: string
    data: {
        reference: string
        amount: number
        status: "success" | "failed"
        account_number: string
        customer: {
            email: string
        }
    }
}



export type ActionResponse<T = null> =
    | {success: true; data: T}
    | {success: false; error: string}



//zustand store types

export type CartItem = {
    product_id: string
    name: string
    image_url: string
    price: number
    quantity: number
    slug: string
}


export type CartState = {
    items: CartItem[]
    coupon: Pick<Coupon, "code" | "discount_type" | "discount_value"> | null
}