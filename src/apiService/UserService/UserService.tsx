import { getStream } from '../../utils/httpRequest';
import ERROR from '../../contants/errorMessage';

const getListFriend = async (userID: string) => {
    try {
        const response = await getStream({ path: `user/getListFriend/${userID}` });
        return response;
    } catch (error) {
        alert(ERROR.ERR_NETWORK.message);
    }
};

export default { getListFriend };
