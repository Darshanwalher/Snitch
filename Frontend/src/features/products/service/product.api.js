import axios from "axios";


const productApiInstance = axios.create({
    baseURL: `/api/products`,
    withCredentials: true,
});

export const createProduct = async(formData)=>{
    const response = await productApiInstance.post("/",formData)
    return response.data;
}

export const getSellerProducts = async(params)=>{
   
    const response = await productApiInstance.get("/seller", { params });
    return response.data;
    
}

export const getAllProducts = async(params)=>{
    const response = await productApiInstance.get("/", { params });
    return response.data;
}

export const searchProducts = async(params)=>{
    const response = await productApiInstance.get("/search", { params });
    return response.data;
}


export const getProductById = async(productId)=>{
    const response = await productApiInstance.get(`/detail/${productId}`);
    return response.data;
}

export const addProductVariant = async(productId,newProductVariant)=>{

    const formData = new FormData();

    newProductVariant.images.forEach((image)=>{
        formData.append(`images`,image.file)
    })

    formData.append("stock",newProductVariant.stock)
    formData.append("priceAmount",newProductVariant.price.amount)
    formData.append("priceCurrency",newProductVariant.price.currency)
    formData.append("attributes",JSON.stringify(newProductVariant.attributes))

    const response = await productApiInstance.post(`/${productId}/variants`,formData)
    return response.data;
    
}

export const deleteProduct = async(productId)=>{
    const response = await productApiInstance.delete(`/delete/${productId}`)
    return response.data;
}

export const deleteProductVariant = async(productId,variantId)=>{
    const response = await productApiInstance.delete(`/delete/variant/${productId}/${variantId}`)
    return response.data;
}

export const updateProductVariant = async(productId, variantId, updatedVariant)=>{
    const formData = new FormData();

    if (updatedVariant.images) {
        updatedVariant.images.forEach((image)=>{
            if (image.file) {
                formData.append(`images`, image.file);
            } else if (image.url) {
                formData.append(`existingImages`, image.url);
            }
        });
    }

    if (updatedVariant.stock !== undefined) formData.append("stock", updatedVariant.stock);
    if (updatedVariant.price?.amount !== undefined) formData.append("priceAmount", updatedVariant.price.amount);
    if (updatedVariant.price?.currency !== undefined) formData.append("priceCurrency", updatedVariant.price.currency);
    if (updatedVariant.attributes) formData.append("attributes", JSON.stringify(updatedVariant.attributes));

    const response = await productApiInstance.patch(`/update/variant/${productId}/${variantId}`, formData);
    return response.data;
}

export const updateProduct = async(productId, updatedProduct)=>{
    const response = await productApiInstance.patch(`/update/product/${productId}`, updatedProduct);
    return response.data;
}

