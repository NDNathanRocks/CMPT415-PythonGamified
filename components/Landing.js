import React, { useEffect, useState, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";

import CodeProblem from "./editor/components/CodeProblem";
import {getQuestionCList, getQuestionU} from "../data/questions.js"
import Context from '../context/Context'
import axios from 'axios'
import { giveStudentScore } from "../data/Students";

const Landing = () => {

  const [questionLists, setquestionLists] = useState([])
  const [page, setpage] = useState([])
  // Context: user, editor state, challenge data, personalization, toast
  const { user, setChallengeData, personalization, setPersonalization, setToast } = useContext(Context)
  const { setEditorState } = useContext(Context)
  
  const loadQuestion = () => {
    getQuestionCList().then(d => {
        setquestionLists(d)
    }).catch(e => {
        console.log(e)
    })
}




    useEffect(() => {
        // calls the function on the load of the page
        loadQuestion();
        console.log(questionLists);
        console.log(Q)
        
    }, []);

    /*useEffect(()=>{

    })

    /*const handlePageChange = () => {
      const length = questionLists.length
    }*/



    /*const Q1 = questionLists.find(obj =>{
      return obj.questionID=== '10002'
    })

    //setQ11(current => [...current,...Q1,...{email:user.email}])
    //console.log(Q11)


    const Q2 = (questionLists.find(obj =>{
      return obj.questionID=== '10003'
    }))

    //setQ2([...Q2,{email:user.email}])
    //console.log(Q2)
    //console.log(questionLists[0])
   


    Q3 = questionLists.find(obj =>{
      return obj.questionID === '10001'
    })
    Q4 = questionLists.find(obj =>{
      return obj.questionID === '10004'
    })
    Q5 = questionLists.find(obj =>{
      return obj.questionID === '10005'
    })*/
    const Q = questionLists.filter(obj =>{
      return obj.questionType === "condition"
    })

    //console.log(Q)

    const Q1 ={
      question: Q[0],
      //questionString:questionLists[0].questionString,
      email: user.email,
    }
    const Q2 ={
      question: Q[1],
      //questionString:questionLists[0].questionString,
      email: user.email,
    }
    const Q3 ={
      question: Q[2],
      //questionString:questionLists[0].questionString,
      email: user.email,
    }
    const Q4 ={
      question: Q[3],
      //questionString:questionLists[0].questionString,
      email: user.email,
    }
    const Q5 ={
      question: Q[4],
      //questionString:questionLists[0].questionString,
      email: user.email,
    }

    
    


    const closeCodingChallenge = () => {
      setEditorState(0)
  }
  console.log(Q1);

  return (
    <>
  <CodeProblem {...Q1}/>
  <CodeProblem {...Q2}/>
  <CodeProblem {...Q3}/>
  <CodeProblem {...Q4}/>
  <CodeProblem {...Q5}/>
  <div class="btn-group btn-group-editor-run" role="group">
        <button type="button" className="btn btn-light" href="#" role="button" onClick={closeCodingChallenge}>Close Coding Challenge</button>
  </div> 
    </>
  );
};
export default Landing;