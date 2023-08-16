import { User, Action, State } from '../type';
import {REGISTER_USER,LOGIN_USER,LOGOUT_USER} from './constants'


const initUser: User = {
    accessToken: '',
    refreshToken: '',
};

const initState:State ={
    user:initUser,
}

const reduce = (state: State, action: Action):State =>{
    switch(action.type){
        case REGISTER_USER:
            return {
                ...state,
            }
        case LOGIN_USER:
            return {
                ...state,
            }
        case LOGOUT_USER:
            return {
                ...state
            }
        default:
            throw new Error('Invalid action');
    }
}

export {initState}

export default reduce