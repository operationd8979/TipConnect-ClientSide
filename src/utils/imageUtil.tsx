/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} imageSrc - Image File url
 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - optional rotation parameter
 */

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180;
}

export default async function getCroppedImg(imageSrc: string, pixelCrop: any, rotation = 0) {
    const image = await createImage(imageSrc);

    const canvas = document.createElement('canvas');
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    if (ctx == null) {
        throw new Error('ctx be created fail');
    }
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate(getRadianAngle(rotation));
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
        data,
        0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
        0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y,
    );

    return canvas;
}

export const generateDownload = async (imageSrc: string, crop: any) => {
    if (!crop || !imageSrc) {
        return;
    }

    const canvas: HTMLCanvasElement | null = await getCroppedImg(imageSrc, crop);

    canvas?.toBlob(
        (blob) => {
            if (blob) {
                const previewUrl = window.URL.createObjectURL(blob);

                const anchor = document.createElement('a');
                anchor.download = 'image.jpeg';
                anchor.href = URL.createObjectURL(blob);
                anchor.click();

                window.URL.revokeObjectURL(previewUrl);
            }
        },
        'image/jpeg',
        0.66,
    );
};

export const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');

    console.log(arr);
    if (arr.length < 2 || !arr[0]) {
        throw new Error('Invalid dataurl format');
    }

    const mime = arr[0].match(/:(.*?);/);

    if (!mime || mime.length < 2) {
        throw new Error('Invalid mime type');
    }

    const mimeValue = mime[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) u8arr[n] = bstr.charCodeAt(n);

    return new File([u8arr], filename, { type: mimeValue });
};

function resizeImage(image: HTMLImageElement, targetWidth: number, targetHeight: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas context could not be created');
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    return canvas;
}

export async function blobUrlToFile(blobUrl: string) {
    const response = await fetch(blobUrl);
    const blobData = await response.blob();

    const fileName = getFileNameFromBlobUrl(blobUrl);

    const file = new File([blobData], fileName, { type: blobData.type });

    return file;
}
function getFileNameFromBlobUrl(blobUrl: string) {
    const matches = blobUrl.match(/\/([^\/?#]+)[^\/]*$/);
    const fileName = matches && matches.length > 1 ? matches[1] : 'file';

    return fileName;
}
