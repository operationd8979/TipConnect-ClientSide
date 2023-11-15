import UserReducer from './userReducer/UserReducer';
import StompReducer from './stompReducer/StompReducer';
import { combineReducers } from 'redux';

const Reducers = combineReducers({
    UserReducer,
    StompReducer,
});

export default Reducers;
