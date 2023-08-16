import userContext from './userContext'
import {User,State,Action} from '../../type'
import reduce , {initState} from '../../reduce/reduce'
import { useReducer } from 'react'

const Provider = ({children}: { children: React.ReactNode }) => {
    

    const [state,dispatch] = useReducer<React.Reducer<State, Action>>(reduce,initState)

    return (
        <userContext.Provider value={[state,dispatch]}>
            {children}
        </userContext.Provider>
    )
}

export default Provider;
