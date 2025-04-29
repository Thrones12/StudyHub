import React, { useState, useEffect } from "react";
import "./ExerciseType.css";

const ExerciseType = ({ types, setTypeSelected }) => {
    return (
        <div className='exercise-type-wrapper'>
            {types.length > 0 &&
                types.map((type, index) => (
                    <div
                        key={index}
                        className='type-element'
                        onClick={() => setTypeSelected(type)}
                    >
                        {type.name}
                    </div>
                ))}
        </div>
    );
};

export default ExerciseType;
