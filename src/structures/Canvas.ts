import { createCanvas, loadImage } from 'canvas';
import { request } from 'undici';
import fs from 'fs';

interface MergeImagesOptions {
    width: number;
    height: number;
    images: string[];
}

export class Canvas {
    public async mergeImages(options: MergeImagesOptions): Promise<Buffer> {
        // count the number of images
        const imageCount = options.images.length;
        // calculate the number of rows and columns
        const rows = Math.ceil(Math.sqrt(imageCount));
        const cols = Math.ceil(imageCount / rows);
        // calculate the width and height of each small image
        const chunkWidth = Math.floor(options.width / cols);
        const chunkHeight = Math.floor(options.height / rows);
        // create a canvas object
        const canvas = createCanvas(options.width, options.height);
        const ctx = canvas.getContext('2d');
        // load all images, draw them to canvas
        const promises = [];
        for (let i = 0; i < imageCount; i++) {
            let { buffer, status } = await request(options.images[i]).then(async r => {
                return {
                    buffer: await r.body.arrayBuffer(),
                    status: r.statusCode,
                };
            });
            if (status !== 200) {
                const response = await request(options.images[i]) as any;
                buffer = await response.body.arrayBuffer();
                status = response.status;
            }
            if (status === 200) {
                const tempFilePath = `temp${i}.tmp`;
                fs.writeFileSync(tempFilePath, Buffer.from(buffer));
                const image = await loadImage(tempFilePath);
                const x = (i % cols) * chunkWidth;
                const y = Math.floor(i / cols) * chunkHeight;
                promises.push(ctx.drawImage(image, x, y, chunkWidth, chunkHeight));
                fs.unlinkSync(tempFilePath); // Remove the temporary file
            }
        }
        await Promise.all(promises);
        // return the canvas
        return canvas.toBuffer();
    }
}
