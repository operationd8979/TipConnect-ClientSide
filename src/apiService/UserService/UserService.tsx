import { get, getStream, post, postMultipart } from '../../utils/httpRequest';
import ERROR from '../../contants/errorMessage';
import { SearchQuery, UpdateInfoRequest } from '../../type';

const getUserInfo = async () => {
    try {
        const response = await get({ path: `user/getUserInfo` });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
        return null;
    }
};

const updateUserInfo = async (updateInfoRequest: UpdateInfoRequest) => {
    try {
        const response = await post({ path: `user/updateUserInfo`, options: updateInfoRequest });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
        return null;
    }
};

const updateAvatar = async (fromData: any) => {
    try {
        const response = await postMultipart({ path: `user/updateAvatar`, options: fromData });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
        return null;
    }
};

const getListFriend = async () => {
    try {
        const response = await getStream({ path: `user/getListFriend` });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
        return null;
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
        return null;
    }
};

export default { getUserInfo, getListFriend, search, updateUserInfo, updateAvatar };
