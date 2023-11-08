import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { State } from '../../type';

const Home = () => {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend } = currentUser;

    useEffect(() => {}, []);
    return (
        <div>
            {isLoggedIn ? (
                <div>
                    Chào mừng bạn đến với <b>TipConnect</b>
                    <br />
                    Khám phá những tiện ích kết nối với bạn bè và đồng nhiệp.
                </div>
            ) : (
                <div>UNLOGIN</div>
            )}
        </div>
    );
};

export default Home;
