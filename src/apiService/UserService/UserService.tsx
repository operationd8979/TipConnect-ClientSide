import { get, getStream, post, postMultipart } from '../../utils/httpRequest';
import ERROR from '../../contants/errorMessage';
import { SearchQuery, UpdateInfoRequest, UpdateAvatarRequest } from '../../type';

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

const updateAvatar = async (request: UpdateAvatarRequest) => {
    try {
        const response = await post({ path: `user/updateAvatar`, options: request });
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

const addFriend = async (friendID: string) => {
    try {
        const response = await get({ path: `user/add/${friendID}` });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
        return null;
    }
};

const getFriendRequests = async () => {
    try {
        const response = await getStream({ path: `user/getFriendRequests` });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
        return null;
    }
};

const acceptFriendRequest = async (requestID: string) => {
    try {
        const response = await get({ path: `user/acceptFriendRequest/${requestID}` });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
        return null;
    }
};

export default {
    getUserInfo,
    getListFriend,
    search,
    updateUserInfo,
    updateAvatar,
    addFriend,
    getFriendRequests,
    acceptFriendRequest,
};
