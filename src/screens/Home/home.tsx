import React, { useEffect, useState, useRef, useCallback, useMemo, useReducer, FormEvent, ChangeEvent } from 'react';
import Memo from './memo';

interface State {
    job: string;
    jobs: string[];
  }
  
  interface Action {
    type: string;
    payload: string | number; 
  }

//init state
const initState = {
    job : '',
    jobs: []
};
//action
const SET_JOB = 'set_job';
const ADD_JOB = 'add_job';
const DEL_JOB = 'del_job';

const setJob = (payload: string) => ({
    type: SET_JOB,
    payload,
});

const addJob = (payload: string) => ({
    type: ADD_JOB,
    payload,
});

const delJob = (payload: number) => ({
    type: DEL_JOB,
    payload,
});

//reducer
const reduce = (state: State, action: Action):State =>{
    console.log('old state:'+state.job);
    switch(action.type){
        case SET_JOB:
            return {
                ...state,job:action.payload as string
            }
        case ADD_JOB:
            return {
                ...state,
                jobs: [...state.jobs,action.payload as string]
            }
        case DEL_JOB:
            const newJobs = [...state.jobs];
            newJobs.splice(action.payload as number,1);
            return {
                ...state,
                jobs: newJobs
            }
        default:
            throw new Error('Invalid action');
    }
}

const Home = () => {

    const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reduce, initState);
    const {job,jobs} = state;
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSetJob = (event:ChangeEvent<HTMLInputElement>) =>{
        dispatch(setJob(event.target.value));
    }

    const handleAddJob = () =>{
        dispatch(addJob(job));
        dispatch(setJob(''));
        inputRef.current?.focus();
    }
    
    return <div style={{margin:10}}>
        <input ref={inputRef} placeholder='job' value={job} onChange={(e)=>handleSetJob(e)} />
        <button onClick={handleAddJob}>add</button>
        {jobs.map((job,index)=>{
            return(
                <li key={index}>{job}
                <span onClick={()=> {dispatch(delJob(index));inputRef.current?.focus();}}>x</span>
                </li>
            )
        })}
    </div >
}

export default Home;