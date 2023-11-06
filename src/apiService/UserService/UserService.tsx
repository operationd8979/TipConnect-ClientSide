import { getStream } from '../../utils/httpRequest';

const getListFriend = async (userID: string) => {
    try {
        const response = await getStream({ path: `user/getListFriend/${userID}` });
        return response;
    } catch (error) {
        alert(error);
    }
};

export default { getListFriend };
