import React from 'react';
import classNames from 'classnames/bind';
import Styles from './Map.module.scss';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const cx = classNames.bind(Styles);

const containerStyle = {
    width: '100%',
    height: '100%',
};

interface Map {
    lat: number;
    lng: number;
}

const Map = ({ lat, lng }: Map) => {
    const center = { lat, lng };

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyBZ4mcwhCFl2OmVLkRuLF_-e1OmMFqFd7g',
    });

    const [map, setMap] = React.useState(null);

    const onLoad = React.useCallback(function callback(map: any) {
        // const bounds = new window.google.maps.LatLngBounds(center);
        // map.fitBounds(bounds);
        setMap(map);
    }, []);

    const onUnmount = React.useCallback(function callback(map: any) {
        setMap(null);
    }, []);

    return (
        <div className={cx('wrapper')}>
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={14}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                >
                    <Marker position={{ lat, lng }} />
                </GoogleMap>
            ) : (
                <div className={cx('robot-map')}>
                    <img src="https://cdn.tgdd.vn/Files/2020/11/10/1305861/googlemap_1280x720-800-resize.jpg" />
                </div>
            )}
        </div>
    );
};

export default React.memo(Map);
