import { get, getStream, post } from '../../utils/httpRequest';
import ERROR from '../../contants/errorMessage';
import { SearchQuery, UpdateInfoRequest } from '../../type';

const getUserInfo = async () => {
    try {
        const response = await get({ path: `user/getUserInfo` });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
    }
};

const updateUserInfo = async (updateInfoRequest: UpdateInfoRequest) => {
    try {
        const response = await post({ path: `user/updateUserInfo`, options: updateInfoRequest });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
    }
};

const getListFriend = async () => {
    try {
        const response = await getStream({ path: `user/getListFriend` });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
    }
};

const search = async (searchQuery: SearchQuery) => {
    try {
        const { query, offset, limit } = searchQuery;
        const response = await get({
            path: `user/search/${query}&${offset}&${limit}`,
        });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
    }
};

export default { getUserInfo, getListFriend, search, updateUserInfo };
