import { get, getStream } from '../../utils/httpRequest';
import ERROR from '../../contants/errorMessage';
import { SearchQuery } from '../../type';

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

export default { getListFriend, search };
