import { get, getStream, post, postMultipart } from '../../utils/httpRequest';
import {} from '../../type';

const getGenres = async () => {
    try {
        const response = await getStream({ path: `movie/getGenres` });
        return response;
    } catch (error) {
        //alert(ERROR.ERR_NETWORK.message);
        return null;
    }
};

const getMovies = async (genres: string, time: string, rating: string, limit: number) => {
    try {
        let url: string = `movie/getMovies?limit=${limit}&`;
        if (genres) url += `genres=${genres}&`;
        if (time) url += `time=${time}&`;
        if (rating) url += `rating=${rating}&`;
        const response = await getStream({ path: url });
        return response;
    } catch (error) {
        //alert(ERROR.ERR_NETWORK.message);
        return null;
    }
};

const getDetailMovie = async (id: string) => {
    try {
        const response = await get({ path: `movie/getDetailMovie?movieId=${id}` });
        return response;
    } catch (error) {
        //alert(ERROR.ERR_NETWORK.message);
        return null;
    }
};

export default {
    getGenres,
    getMovies,
    getDetailMovie,
};
