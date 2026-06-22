import ImageKit from "@imagekit/nodejs"
import { config } from "../config/config.js";

const client = process.env.NODE_ENV === "test" ? null : new ImageKit({
    privateKey:config.IMAGEKIT_PRIVATE_KEY,
})

export async function uploadFile({buffer,fileName,folder = "snitch"}){
    if (process.env.NODE_ENV === "test") {
        return {
            url: "https://ik.imagekit.io/mock/image.jpg",
            fileId: "mock_file_id"
        };
    }
    
    const result = await client.files.upload({
        file: await ImageKit.toFile(buffer),
        fileName,
        folder
    })

    return result;
}