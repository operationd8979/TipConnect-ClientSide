import Styles from './MessageArea.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(Styles);

const Chat = ({
    fullName,
    urlAvatar,
    content,
    isUser,
    seen,
}: {
    fullName: string;
    urlAvatar: string;
    content: string;
    isUser: boolean;
    seen: boolean;
}) => {
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
