import { Action, StreamingState } from '../../type';
import actionTypes from './Action';

const initialState: StreamingState = {
    movies: [],
    hotMovies: [],
    trendingMovies: [],
    genres: [],
    users: [],
};

const MovieReducer = (state: StreamingState = initialState, action: Action) => {
    const { type, payload } = action;
    switch (type) {
        case actionTypes.GET_GENRES:
            return { ...state, genres: payload };
        case actionTypes.ADD_MOVIES:
            return { ...state, movies: payload };
        case actionTypes.ADD_HOT_MOVIES:
            return { ...state, hotMovies: payload };
        case actionTypes.ADD_TRENDING_MOVIES:
            return { ...state, trendingMovies: payload };
        case actionTypes.ADD_USERS:
            return { ...state, users: payload };
        default:
            return state;
    }
};

export default MovieReducer;
