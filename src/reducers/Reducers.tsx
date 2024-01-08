import UserReducer from './userReducer/UserReducer';
import StompReducer from './stompReducer/StompReducer';
import MovieReducer from './movieReducer/MovieReducer';
import { combineReducers } from 'redux';

const Reducers = combineReducers({
    UserReducer,
    StompReducer,
    MovieReducer,
});

export default Reducers;
