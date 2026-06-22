import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: `https://snitch-trend.onrender.com/api/cart`,
    withCredentials: true
})


export const addItem = async({productId,variantId})=>{
    const response = await cartApiInstance.post(`/add/${productId}/${variantId}`,{
        quantity:1
    })
    return response.data;
}

export const getCart = async()=>{
    const response = await cartApiInstance.get("/")
    return response.data;
}


export const incrementCartItemApi = async({productId,variantId})=>{
    const response = await cartApiInstance.patch(`/quantity/increment/${productId}/${variantId}`)
    return response.data;
}

export const decrementCartItemApi = async({productId,variantId})=>{
    const response = await cartApiInstance.patch(`/quantity/decrement/${productId}/${variantId}`)
    return response.data;
}

export const removeItemApi = async({productId,variantId})=>{
    const response = await cartApiInstance.delete(`/item/${productId}/${variantId}`)
    return response.data;
}

export const createBuyNowOrderApi = async ({ productId, variantId, quantity }) => {
    const response = await cartApiInstance.post("/payment/buy-now", {
        productId,
        variantId,
        quantity
    });
    return response.data;
}

export const createCartOrder = async()=>{
    const response = await cartApiInstance.post("/payment/create/order")
    return response.data;
}

export const verifyCartOrder = async({razorpay_order_id, razorpay_payment_id, razorpay_signature})=>{
    const response = await cartApiInstance.post("/payment/verify/order",{
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    })
    return response.data;
}




