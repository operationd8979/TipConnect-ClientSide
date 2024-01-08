import { Genre, Movie, User } from '../../../type';
import movieReducerAction from './movieReducerAction';

export const getGenres = (payload: Genre[]) => {
    return {
        type: movieReducerAction.GET_GENRES,
        payload,
    };
};

export const addMovies = (payload: Movie[]) => {
    return {
        type: movieReducerAction.ADD_MOVIES,
        payload,
    };
};

export const addHotMovies = (payload: Movie[]) => {
    return {
        type: movieReducerAction.ADD_HOT_MOVIES,
        payload,
    };
};

export const addTrendingMovies = (payload: Movie[]) => {
    return {
        type: movieReducerAction.ADD_TRENDING_MOVIES,
        payload,
    };
};

export const addUsers = (payload: User[]) => {
    return {
        type: movieReducerAction.ADD_USERS,
        payload,
    };
};
