import { useEffect } from 'react';
import classNames from 'classnames/bind';
import Styles from './CallCard.module.scss';

import { Call, VideoCall, Close } from '../../components/Icons';
import { MessageChat } from '../../type';
import { Client } from 'webstomp-client';
import pathAudio from '../../contants/pathAudio';
import { SocketService } from '../../apiService';

const cx = classNames.bind(Styles);

interface CallCard {
    userID: string;
    stompClient: Client;
    relationShipID: string;
    fullName: string;
    urlAvatar: string;
    type: string;
    setCallGuy: React.Dispatch<
        React.SetStateAction<{
            relationShipID: string;
            fullName: string;
            urlAvatar: string;
            type: string;
        } | null>
    >;
}

const CallCard = ({ userID, stompClient, relationShipID, fullName, urlAvatar, type, setCallGuy }: CallCard) => {
    useEffect(() => {
        const audioElement = new Audio(pathAudio.nokiaSound);
        audioElement.loop = true;
        const handleMouseMove = () => {
            if (document.hasFocus()) audioElement.play();
        };
        document.body.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.body.removeEventListener('mousemove', handleMouseMove);
            audioElement.pause();
            audioElement.currentTime = 0;
        };
    }, []);

    const handleAcceptCall = () => {
        setCallGuy(null);
        window.open(`/call/${relationShipID}/${fullName}/${type}/listener`, '_blank', 'width=500,height=500');
    };

    const handleCloseCall = () => {
        const chat: MessageChat = {
            from: userID,
            to: relationShipID,
            type: 'RTC',
            body: 'cancel',
            timestamp: new Date().getTime().toString(),
            seen: true,
            user: true,
        };
        SocketService.sendTradeMessage(stompClient, chat);
        setCallGuy(null);
    };

    return (
        <div className={cx('wrraper')}>
            <div className={cx('crop_container')}>
                <div className={cx('avatar-card')}>
                    <img src={urlAvatar} alt={fullName} />
                </div>
                <div className={cx('name-card')}>{fullName}</div>
                <div className={cx('call-actions')}>
                    <div className={cx('button-wrraper')}>
                        <button onClick={handleAcceptCall}>{type === 'call' ? <Call /> : <VideoCall />}</button>
                    </div>
                    <div className={cx('button-wrraper')}>
                        <button onClick={handleCloseCall}>
                            <Close />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallCard;
