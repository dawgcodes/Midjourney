import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { request } from "undici";

interface MergeImagesOptions {
    width: number;
    height: number;
    images: string[];
}

export class Canvas {
    public async mergeImages(options: MergeImagesOptions): Promise<Buffer> {
        let tempDirPath: string | undefined;

        try {
            const { width, height, images } = options;

            if (width <= 0 || height <= 0 || !Array.isArray(images) || images.length === 0) {
                throw new Error("Invalid parameters for mergeImages");
            }

            const imageCount = images.length;
            const rows = Math.ceil(Math.sqrt(imageCount));
            const cols = Math.ceil(imageCount / rows);
            const chunkWidth = Math.floor(width / cols);
            const chunkHeight = Math.floor(height / rows);
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext("2d");

            tempDirPath = await fs.mkdtemp(`${tmpdir()}/temp`);

            const promises = images.map(async (imageUrl, index) => {
                const tempFileName = `${tempDirPath}/temp${index}.tmp`;

                try {
                    const response = await request(imageUrl);
                    if (response.statusCode !== 200) {
                        throw new Error(`Failed to fetch image: ${imageUrl}`);
                    }
                    const buffer = await response.body.arrayBuffer();
                    await fs.writeFile(tempFileName, Buffer.from(buffer));
                    const image = await loadImage(tempFileName);
                    const x = (index % cols) * chunkWidth;
                    const y = Math.floor(index / cols) * chunkHeight;
                    ctx.drawImage(image, x, y, chunkWidth, chunkHeight);
                } catch (error) {
                    throw new Error(`Error processing image ${index}: ${(error as Error).message}`);
                } finally {
                    await fs.unlink(tempFileName).catch(console.error);
                }
            });

            await Promise.all(promises);

            return canvas.toBuffer("image/png");
        } catch (error) {
            throw new Error(`Error merging images: ${(error as Error).message}`);
        } finally {
            if (tempDirPath) {
                await fs.rm(tempDirPath, { recursive: true }).catch(console.error);
            }
        }
    }
}
