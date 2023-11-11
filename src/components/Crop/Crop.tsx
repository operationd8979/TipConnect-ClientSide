import { useState } from 'react';
import classNames from 'classnames/bind';
import Styles from './Crop.module.scss';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '../../utils/imageUtil';

const cx = classNames.bind(Styles);

const Crop = ({ urlAvatar, handleCropImage }: { urlAvatar: any; handleCropImage: (previewUrl: string) => void }) => {
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
        console.log(croppedAreaPixels);
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const onCrop = async () => {
        const croppedImageUrl = await getCroppedImg(urlAvatar, croppedAreaPixels);
        croppedImageUrl.toBlob(
            (blob) => {
                if (blob) {
                    const previewUrl = URL.createObjectURL(blob);
                    handleCropImage(previewUrl);
                }
            },
            'image/jpeg',
            0.6,
        );
    };

    return (
        <div>
            <div className={cx('crop_container')}>
                <Cropper
                    image={urlAvatar}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                ></Cropper>
            </div>
            <div className={cx('controls')}>
                <div className={cx('button_area')}>
                    <button onClick={onCrop}>Crop</button>
                </div>
            </div>
        </div>
    );
};

export default Crop;
