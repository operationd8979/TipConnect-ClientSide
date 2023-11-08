import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import classNames from 'classnames/bind';
import Styles from './MessageArea.module.scss';

const cx = classNames.bind(Styles);

const MessageArea = () => {
    const { friendId } = useParams();

    useEffect(() => {
        console.log(friendId);
    }, [friendId]);

    return <div>Message from {friendId}</div>;
};

export default MessageArea;
