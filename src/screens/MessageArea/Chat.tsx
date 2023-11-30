import classNames from 'classnames/bind';
import Styles from './MessageArea.module.scss';
import { useEffect } from 'react';

interface Chat {
    fullName: string;
    urlAvatar: string;
    content: string;
    isUser: boolean;
    seen: boolean;
    type: string;
}

const cx = classNames.bind(Styles);

const Chat = ({ fullName, urlAvatar, content, isUser, seen, type }: Chat) => {
    return (
        <div className={cx('wrapper-chat', { 'friend-chat': !isUser, 'user-chat': isUser })}>
            {!isUser && (
                <div className={cx('chat-avatar')}>
                    <img src={urlAvatar} alt={fullName} />
                </div>
            )}
            <div className={cx('chat-content')}>
                {type === 'MESSAGE' ? (
                    content
                ) : type === 'PHOTO' || type === 'GIF' ? (
                    <img src={content} className={cx('chat-content-gif')} />
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
