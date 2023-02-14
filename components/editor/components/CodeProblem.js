import React, { useEffect, useState, Component, useRef } from "react";
import Problem from "./Problem";
import { doc, getDoc, setDoc, updateDoc, addDoc} from "firebase/firestore"; 
import { getStudentById, getStudent,Student, giveStudentScoreCode, takeStudentScoreCode, getStudentScoreCode} from "../../../data/Students";
import {getQuestionUUID} from "../../../data/questions.js"
import {db} from "../../../firebase";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
//import componentWillMount from 'component-will-mount-hook'
import check from './icons8-check-mark-48.png'
import downArrow from './down-arrow.png'
import upArrow from './up-arrow.png'

import axios from "axios";
import { classnames } from "../utils/general";

import "react-toastify/dist/ReactToastify.css";

import Editor from "@monaco-editor/react";
import { Icons } from "react-toastify";



export default class CodeProblem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: ``, //localStorage.getItem('input')||
      output: ``,
      language_id:localStorage.getItem('language_Id')|| 2,
      user_input: ``,
      isVisible: false,
      grade:``,
      output_code:``,
      answer:``,
      currentscore:``,
      show:false ,
      completed: false,
    };
    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.editorRef = React.createRef();



    
  }

  async componentWillMount() {
    const score = getStudentScoreCode(this.props.email)
    score.then(async value => {
      // console.log(value);
      // console.log(typeof value)
    
    var point = parseInt(value)
    this.setState({currentscore:point})
     })

    
}

// AN ATTEMPT TO LOAD THE CHECK MARKS AT THE BEGINNING WHEN THE PROBLEM LOADS SHOWING WHICH QUESTIONS THE USER HAS ALREADY DONE
// componentDidMount(){
//   const submission = doc(db, "submissions", this.props.email, "questionAttempts", (this.props.question.questionID).toString());
//   const docSnap = async () => {await getDoc(submission)};

    
//     if (docSnap.exists()) {
//         //update if exists
//       var sub = docSnap.data();
//       if (sub["completed"]){
//         this.setState({completed: true});
//         alert("kk")
//       }
//     }
// }




  toggleVisibility(){
    if (this.state.isVisible){
       this.setState({ isVisible: false });
    }
    else {
      this.setState({ isVisible: true });
    }
    //var bruh = this.state.isVisible;
   //alert(JSON.stringify(bruh));
  // alert(JSON.stringify(img))
  }
  
  handleEditorDidMount = (editor, monaco) =>{
    this.editorRef.current = editor
}



  input = (event) => {
 
    event.preventDefault();
  
    this.setState({ input: event.target.value });
    localStorage.setItem('input', event.target.value)
 
  };
  userInput = (event) => {
    event.preventDefault();
    this.setState({ user_input: event.target.value });
  };
  language = (event) => {
   
    event.preventDefault();
   
    this.setState({ language_id: event.target.value });
    localStorage.setItem('language_Id',event.target.value)
   
  };

  submit = async (e) => {
    e.preventDefault();

    
    let outputText = document.getElementById("output");
    outputText.innerHTML = "";
    outputText.innerHTML += "Creating Submission ...\n";
    const editorText = this.editorRef.current+ this.props.question.questionCode.replaceAll("\\n", "\n");

    
  


    const response = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        method: "POST",
        headers: {
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY, // Get yours for free at https://rapidapi.com/judge0-official/api/judge0-ce/
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          source_code: editorText,
          stdin: this.state.user_input,
          language_id: 71,
        }),
      }
    );
    outputText.innerHTML += "Submission Created ...\n";
    const jsonResponse = await response.json();

    let jsonGetSolution = {
      status: { description: "Queue" },
      stderr: null,
      compile_output: null,
    };

    while (
      jsonGetSolution.status.description !== "Accepted" &&
      jsonGetSolution.stderr == null &&
      jsonGetSolution.compile_output == null
    ) {
      outputText.innerHTML = `Creating Submission ... \nSubmission Created ...\nChecking Submission Status\nstatus : ${jsonGetSolution.status.description}`;
      if (jsonResponse.token) {
        let url = `https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;

        const getSolution = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY, // Get yours for free at https://rapidapi.com/judge0-official/api/judge0-ce/
            "content-type": "application/json",
          },
        });

        jsonGetSolution = await getSolution.json();
      }
    }
    if (jsonGetSolution.stdout) {
      const output = atob(jsonGetSolution.stdout);
      this.setState({output_code: output})

      outputText.innerHTML = "";

      outputText.innerHTML += `${output}`;
      
    } else if (jsonGetSolution.stderr) {
      const error = atob(jsonGetSolution.stderr);

      outputText.innerHTML = "";

      outputText.innerHTML += `\n Error :${error}`;
      this.setState({ grade: 0 });
    } else {
      const compilation_error = atob(jsonGetSolution.compile_output);

      outputText.innerHTML = "";

      outputText.innerHTML += `\n Error :${compilation_error}`;
      this.setState({ grade: 0 });
    }



    let outputText1 = document.getElementById("answer");
    //outputText.innerHTML = "";
    //outputText.innerHTML += "Creating Submission ...\n";
    const editorText1 = this.props.question.questionAnswer.replaceAll("\\n", "\n") + this.props.question.questionCode.replaceAll("\\n", "\n");
    //editorText = this.props.questionAnswer.replaceAll("  ", "\g");
    const response1 = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        method: "POST",
        headers: {
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY, // Get yours for free at https://rapidapi.com/judge0-official/api/judge0-ce/
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          source_code: editorText1,
          stdin: this.state.user_input,
          language_id: 71,
        }),
      }
    );
    console.log("bbbbb")
    //outputText.innerHTML += "Submission Created ...\n";
    const jsonResponse1 = await response1.json();

    let jsonGetSolution1 = {
      status: { description: "Queue" },
      stderr: null,
      compile_output: null,
    };

    while (
      jsonGetSolution1.status.description !== "Accepted" &&
      jsonGetSolution1.stderr == null &&
      jsonGetSolution1.compile_output == null
    ) {
      //outputText.innerHTML = `Creating Submission ... \nSubmission Created ...\nChecking Submission Status\nstatus : ${jsonGetSolution.status.description}`;
      if (jsonResponse1.token) {
        let url = `https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse1.token}?base64_encoded=true`;

        const getSolution1 = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY, // Get yours for free at https://rapidapi.com/judge0-official/api/judge0-ce/
            "content-type": "application/json",
          },
        });

        jsonGetSolution1 = await getSolution1.json();
      }
    }
    const score = getStudentScoreCode(this.props.email)
    score.then(async value => {
      // console.log(value);
      // console.log(typeof value)
    var point = parseInt(value)
    var point2 = 0;

    if (jsonGetSolution1.stdout) {
      console.log("cccc")
      const output1 = atob(jsonGetSolution1.stdout);


      //outputText.innerHTML = "";

      //outputText.innerHTML += `${output}`;
      if(output1 === this.state.output_code){
        this.setState({ grade: 100 });
      
        alert("Correct")
        //giveStudentScoreCode(this.props.email,100)
        console.log("aaaaaa")
        point2 = point2+100
      }
      else{
        this.setState({ grade: 0 });
      }
    } 
    //start
    //giveStudentScoreCode(this.props.email,20)

     //Check if question is completed, store that it has been completed so user cannot farm points from repeating same question
    var completed = false;
    if (point2 === 100){
      completed = true;
    } 

    //Creating submission to store answers
    const submission = doc(db, "submissions", this.props.email, "questionAttempts", (this.props.question.questionID).toString());
    const docSnap = await getDoc(submission);
   
    

      if (docSnap.exists()) {
        //update if exists
          var sub = docSnap.data();

            
          if (sub["completed"]){
            console.log("");
             this.setState({completed: true})
             alert("You have already completed this question before")
          }
          else{
            if (completed){
              await updateDoc(submission, {
               "code": this.editorRef.current,
               "questionID": this.props.question.questionID,
               "completed": completed,
              });
              giveStudentScoreCode(this.props.email,100)
            }
            point = point + 100
            this.setState({completed: true})
          }
      } else {
        
        //add if it doesn't exist
        await setDoc(doc(db, "submissions", this.props.email, "questionAttempts", (this.props.question.questionID).toString()), {
          "code": this.editorRef.current,
          "questionID": this.props.question.questionID,
          "completed": completed,
        });
        if (completed){
          giveStudentScoreCode(this.props.email,this.state.grade);
          this.setState({completed: true})
          point = point + 100
        }
      }
      this.setState({currentscore:point})


  })
  };

  

  openQuestions = (uuid) => {
    getQuestionU(uuid).then(p => {
        setQuestion(p)
    }).catch(e => {
        console.log(e)
    })
  }

  handleModal(){  
    const score = getStudentScoreCode(this.props.email)
    score.then(value => {
      // console.log(value);
      // console.log(typeof value)
    var point = parseInt(value)
    //console.log(score)
    //console.log(this.editorRef)
    if(this.editorRef.current !== null){
      this.setState({show:!this.state.show})
    }
    else if(point >= 10){
      this.setState({show:!this.state.show})
      takeStudentScoreCode(this.props.email,10)
      point = point - 10
    }
    this.setState({currentscore:point})
  })
  }  
  handleModal2(){  
      this.setState({show:!this.state.show})
  }

  render() {

   
 
    return (
      <>
       <div style={{
               position: 'relative', left: '0%', width: '100%', margin: "0px 0px 40px 0px" 
        }} className= "border-4 rounded-3xl border-emerald-900 border-double bg-teal-50">
         
         
         <div style={{fontSize: 24}} onClick={this.toggleVisibility} className="bg-teal-100	flex items-center justify-center gap-16 content-end border-emerald-900/50 border-4 rounded-3xl	">
            <div className="absolute top-3 right-20">
            {this.state.isVisible && <img src={upArrow.src}/>}
            {!this.state.isVisible && <img src={downArrow.src}/>}
            </div>
            <center><h4>{this.props.question.questionTitle}</h4></center>
            {this.state.completed && <div style={{color: "green", fontSize: 12}}>Completed <img src={check.src}/></div>}
            {!this.state.completed && <div style={{color: "red", fontSize: 12}}>Not done yet</div>}
             
            
          
            
          </div>

          {this.state.isVisible && 
          <div style={{ padding: "2%", maxHeight: '30vh', fontSize: "1.125rem"
          }} className="bg-teal-50">
          <Problem questionString={this.props.question.questionString}/>
          </div>
          }


        {this.state.isVisible &&
        <div>
          <div className="flex flex-row space-x-2 items-start px-2 py-2 ">
            <div className="flex flex-col w-full h-full justify-start items-end">
          
            <Editor
                height="70vh"
                defaultLanguage="python"
                defaultValue={this.props.question.questionFiller.replaceAll("\\n", "\n")}
                onChange={this.handleEditorDidMount}
                theme="vs-dark"
            />

            </div>

          

          <div className="right-container flex flex-shrink-0 w-[35%] flex-col">
          <textarea id="input"  
            rows="4"
            className={classnames(
            "focus:outline-none w-full border-2 border-black z-10 rounded-md shadow-[0px_0px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white mt-2"
          )}
           onChange={this.userInput}
           placeholder={`Custom input`}
           ></textarea>

           <div className="flex flex-col items-end">
          
          <textarea 
              id="output"
              rows="7"
          className={classnames(
            "focus:outline-none w-full border-2 border-black z-10 rounded-md shadow-[0px_0px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white mt-2")}
            placeholder={`Output Window`}
            ></textarea>
           
          </div>
          
          <div className="right-container flex flex-shrink-0 w-[25%] flex-col">
          <button
            type="submit"
            className="mt-2.5 border-2 border-black z-5 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-100 bg-white flex-shrink-0"
            onClick={this.submit}
            >
            <i className="fas fa-cog fa-fw "></i> Run
            </button>
            </div>

            <div style={{ display: 'flex'}}>
            <div className="right-container flex flex-shrink-0 w-[25%] flex-col">
            <button
            type="submit"
            className="mt-2.5 border-2 border-black z-5 rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0)] px-2 py-2 hover:shadow transition duration-100 bg-white flex-shrink-0"
            onClick={()=>this.handleModal()}
            id=""
            >
            <i className="fas fa-cog fa-fw "></i> Hint
          </button>
          </div>
          <p className="hintClass">
            Need 10 points to see the Hint 
          </p>
          </div>
          <div className="metrics-container mt-3 flex flex-col space-y-">
          <p className="text-sm">
            Score:{" "}
            <span className="font-semibold px-2 py-1 rounded-md bg-gray-100">
            {this.state.grade}
            </span>
          </p>
          <p className="text-sm">
            Total Score:{" "}
            <span className="font-semibold px-2 py-1 rounded-md bg-gray-100">
            {this.state.currentscore}
            </span>
          </p>
          </div>

          </div>

          </div>
        </div>
          
          }
          


          {<Modal show={this.state.show} onHide={()=>this.handleModal()} dialogClassName='custom-dialog'>  
          
          <Modal.Body>{this.props.question.questionHint}</Modal.Body>  
          <Modal.Footer>  
            <Button onClick={()=>this.handleModal2()}>Close</Button>  
          </Modal.Footer>  
        </Modal>}



        </div>
      </>
    );
  }
}



CodeProblem.defaultProps = {
  question:{
    profilePictureSrc: 'https://example.com/no-profile-picture.jpg',
    questionTitle: "QuestionTitle",
    questionID: {},
    questionFiller: "#Example code",
    questionAnswer: "#",
    questionCode: "#",
    questionHint: "hhhhhhhh",},
  email:"#"
};