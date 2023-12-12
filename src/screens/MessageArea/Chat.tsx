import classNames from 'classnames/bind';
import Styles from './MessageArea.module.scss';
import { useEffect } from 'react';
import { pathImage } from '../../contants';
import { Call, CallIncome, CallOut } from '../../components/Icons';
import hardData from '../../contants/hardData';
import Map from '../../components/Map';

interface Chat {
    fullName: string;
    urlAvatar: string;
    content: string;
    isUser: boolean;
    seen: boolean;
    type: string;
    isLast: boolean;
}

const cx = classNames.bind(Styles);

const Chat = ({ fullName, urlAvatar, content, isUser, seen, type, isLast }: Chat) => {
    return (
        <div className={cx('wrapper-chat', { 'friend-chat': !isUser, 'user-chat': isUser })}>
            {!isUser && (
                <div className={cx('chat-avatar')}>
                    <img src={urlAvatar} alt={fullName} />
                </div>
            )}
            {isLast && isUser && seen && <div className={cx('seen-notification')}>đã xem</div>}
            <div className={cx('chat-content')}>
                {type === hardData.typeMessage.MESSAGE.name ? (
                    content
                ) : type === hardData.typeMessage.PHOTO.name || type === hardData.typeMessage.GIF.name ? (
                    <a href={content} target="_blank">
                        <img src={content} className={cx('chat-content-gif')} />
                    </a>
                ) : type === hardData.typeMessage.PDF.name ? (
                    <a className={cx('chat-content-file')} href={content} target="_blank">
                        <img src={pathImage.pdfFile} />
                        {content.substring(86)}
                    </a>
                ) : type === hardData.typeMessage.WORD.name ? (
                    <a className={cx('chat-content-file')} href={content} target="_blank">
                        <img src={pathImage.wordFile} />
                        {content.substring(86)}
                    </a>
                ) : type === hardData.typeMessage.EXCEL.name ? (
                    <a className={cx('chat-content-file')} href={content} target="_blank">
                        <img src={pathImage.excelFile} />
                        {content.substring(86)}
                    </a>
                ) : type === hardData.typeMessage.ENDCALL.name ? (
                    <div className={cx('chat-content-call')}>
                        {isUser ? <CallOut /> : <CallIncome />}
                        <div className={cx('chat-content-call-duration')}>
                            {(Number.parseInt(content) / 1000).toFixed()} giây
                        </div>
                    </div>
                ) : type === hardData.typeMessage.GEO.name ? (
                    <Map lat={Number(content.split('@')[0])} lng={Number(content.split('@')[1])}></Map>
                ) : (
                    'WRONG TYPE'
                )}
            </div>
            {isUser && (
                <div className={cx('chat-avatar')}>
                    <img src={urlAvatar} alt={fullName} />
                </div>
            )}
        </div>
    );
};

export default Chat;
