import React, { useContext, useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, getDoc, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import Context from '../context/Context';


function ChallengeQuestionComponent() {
    
    // const { challengeNumber } = useContext(Context)
    // const chalQuestionsRef = collection(db, "quiz-questions/conditional-statements/challenge")

    // const  [theData, setTheData]  = useState()

    // useEffect(() => {

        // const getQuestionsList = async() => {
        //     const data = await getDocs(chalQuestionsRef);
        //     const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
        //     setTheData(filteredData[challengeNumber], challengeNumber);
        // };
    
        // getQuestionsList()

        
        // });
        
    // setTheData(
    const theData = 
        [
            {question: "While Loop Question 1",
                answer: "me1"},
            {question: "For Loop Question 2",
                answer: "me2"},
            {question: "Nested For Loop Question 3",
                answer: "me3"},
            {question: "Largest Number Question 4 big quesion goes here",
                answer: "me4"},
        ]

    // )
    // getPrompt(theData[challengeNumber]);
        

    return theData
    
    // (
    //     <div>
    //         {
    //             theData && theData[challengeNumber].question
    //         }
    //     </div>
    // )
}
export default ChallengeQuestionComponent;

