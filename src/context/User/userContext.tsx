import {createContext} from 'react'
import {State} from '../../type'

const userContext = createContext<any | undefined>(undefined);

export default userContext;