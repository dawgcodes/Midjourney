import { createCanvas, loadImage } from 'canvas';
import fs from 'node:fs/promises';
import { request } from 'undici';

interface MergeImagesOptions {
    width: number;
    height: number;
    images: string[];
}

export class Canvas {
    public async mergeImages(options: MergeImagesOptions): Promise<Buffer> {
        try {
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
            const promises = options.images.map(async (imageUrl, index) => {
                try {
                    const response = await request(imageUrl);
                    if (response.statusCode !== 200) {
                        throw new Error(`Failed to fetch image: ${imageUrl}`);
                    }
                    const buffer = await response.body.arrayBuffer();
                    const tempFilePath = `temp${index}.tmp`;
                    await fs.writeFile(tempFilePath, Buffer.from(buffer));
                    const image = await loadImage(tempFilePath);
                    const x = (index % cols) * chunkWidth;
                    const y = Math.floor(index / cols) * chunkHeight;
                    ctx.drawImage(image, x, y, chunkWidth, chunkHeight);
                    await fs.unlink(tempFilePath); // Remove the temporary file
                } catch (error) {
                    console.error(`Error processing image ${index}:`, error);
                }
            });
            await Promise.all(promises);
            // return the canvas
            return canvas.toBuffer();
        } catch (error) {
            console.error('Error merging images:', error);
            throw error; // rethrow the error
        }
    }
}
