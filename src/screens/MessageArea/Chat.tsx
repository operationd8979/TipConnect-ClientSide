import classNames from 'classnames/bind';
import Styles from './MessageArea.module.scss';

interface Chat {
    fullName: string;
    urlAvatar: string;
    content: string;
    isUser: boolean;
    seen: boolean;
}

const cx = classNames.bind(Styles);

const Chat = ({ fullName, urlAvatar, content, isUser, seen }: Chat) => {
    return (
        <div className={cx('wrapper-chat', { 'friend-chat': !isUser, 'user-chat': isUser })}>
            {!isUser && (
                <div className={cx('chat-avatar')}>
                    <img src={urlAvatar} alt={fullName} />
                </div>
            )}
            <div className={cx('chat-content')}>{content}</div>
            {isUser && (
                <div className={cx('chat-avatar')}>
                    <img src={urlAvatar} alt={fullName} />
                </div>
            )}
        </div>
    );
};

export default Chat;
