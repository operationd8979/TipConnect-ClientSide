import React, { useEffect, useState, useRef, memo } from 'react';
import { ArrowFunction } from 'typescript';

const Memo = ({onIncrease} : {onIncrease: () => void}) => {

    console.log('re-render');
    
    return <div>
        <h1>anb</h1>
        <button onClick={onIncrease}>++</button>
    </div >
}

export default React.memo(Memo);