import { get, getStream, post, postMultipart } from '../../utils/httpRequest';
import {} from '../../type';

const getAllUsers = async () => {
    try {
        const response = await getStream({ path: `user/getAllUser` });
        return response;
    } catch (error) {
        //alert(ERROR.ERR_NETWORK.message);
        return null;
    }
};

export default {
    getAllUsers,
};
