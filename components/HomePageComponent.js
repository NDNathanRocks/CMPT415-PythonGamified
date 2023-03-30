import BadgesComponent from "./BadgesComponent";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useContext } from 'react'
import React, { useState, useEffect } from 'react';
import { getStudentScore } from '../data/Students'
import Context from '../context/Context'
import RecentActivityComponent from './RecentActivityComponent'
import OpenModuleComponent from './OpenModuleComponent'
import EditorComponent from './EditorComponent'
import EasyEditorComponent from './EasyEditorComponent'
import LeaderboardComponent from './LeaderboardComponent'
import { Modal } from "react-bootstrap"
import { db } from '../firebase'
import { collection, query, where, getDocs, getDoc, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getQuestionsList, updateScore, solvedQuestionUpdate, checkHintUsedAndUpdate, updateQuestionData, getQuestionData } from "../data/ChallengeQuestions"

// import { getQuestionsList } from "../data/ChallengeQuestions"

export default function HomePageComponent() {
    library.add(fab, fas, far)
    const { openedModule, setOpenedModule, editorState, setChallengeQuestion, challengeQuestion, user } = useContext(Context)
    const chalQuestionsRef = collection(db, "quiz-questions/conditional-statements/challenge")

    const currentScore = getStudentScore(user)

    useEffect(() => {
        // get questions from firebase:
        const readFireBaseData = () => {

            // const getQuestionsList = async() => {
            //     const data = await getDocs(chalQuestionsRef);
            //     const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
            //     // const replacedData = JSON.parse(JSON.stringify(filteredData).replaceAll("/\\n/g",'\n'));
            //     // console.log(replacedData);
            //     setChallengeQuestion(filteredData);
            // };
            
            // const qlist = getQuestionsList()
            // setChallengeQuestion(qlist)
            // getQuestionsList()

            // setChallengeQuestion([
            //     {question: "Write a program that prints 'x' if the number inside the variable 'x' is greater than 5.",
            //         answer: "7",
            //         hint: "Use an if statement to check if x > 5, this way you can compare x with the number 5 and see if its greater than or not.\nThen you can use the print statment inside the if statement by creating an indentation in the next line.",
            //         title: "If Statement (easy)",
            //         output: "my old output1 goes here",
            //         completed: false,
            //         starterCode: "x = 7\n",
            //         mycode: "# Use this variable to check your output\nx = 7\n# Write your code here\n"
            //     },
            //     {question: "For Loop Question 2",
            //         answer: "me2",
            //         hint: "hint2",
            //         title: "If Statement (med)",
            //         output: "my old output2 goes here",
            //         completed: false,
            //         starterCode: "x = 8\n",
            //         mycode: "# Write your code here\n"
            //     },
            //     {question: "Nested For Loop Question 3",
            //         answer: "me3",
            //         hint: "hint3",
            //         title: "If Statement (hard)",
            //         output: "my old output3 goes here",
            //         completed: false,
            //         starterCode: "y = 7\n",
            //         mycode: "# Write your code here\n"
            //     },
            //     {question: "Largest Number Question 4 big quesion goes here",
            //         answer: "me4",
            //         hint: "hint4",
            //         title: "While Loop (easy)",
            //         output: "my old output4 goes here",
            //         completed: true,
            //         starterCode: "x = 700\n",
            //         mycode: "# Write your code here\n"
            //     },
            // ])
        }

        // readFireBaseData();
        console.log("Home Page Mounted!")
        setChallengeQuestion([])
        console.log("Reading Data from Firebase");
        const theQuestions = getQuestionData(user)
        theQuestions.then(value => {
            setChallengeQuestion(value)
            console.log(challengeQuestion.conditional_statements)
        })
    }, [])

    /*
    * Get and display users current amount of coins
    */
    function show_point() {
        currentScore.then((value) => {
            document.getElementById('p').innerHTML = value + ' </p>';
        });
    }

    const handleModuleStart = (e) => {
        setOpenedModule(e.currentTarget.getAttribute('module'))
    }

    /**
     * Returns the editor for the module.
     * Can be either an EasyEditorComponent or an EditorComponent.
     */
    const getEditor = () => {
        if (editorState === 0) {
            return (<></>)
        } else if (editorState === 1) {
            return (
                <div className="" style={{right: 0}}>
                    <EditorComponent />
                </div>
            )
        } else if (editorState === 2) {
            return (
                <div className="col-5 position-fixed b-r" style={{right: 0}}>
                    <EasyEditorComponent />
                </div>
            )
        }
    }

    /**
    * Modal Stuff
    **/
    const [modalHowToShow, setModalHowToShow] = useState(false);
    const [open, setOpen] = useState(false);
    function handleClose(){
        setOpen (false);
    }
    function handleOpen(){
        setOpen(true);
    }
    function HowToModal(props) {      
        return (
          <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
          >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter"> {props.title} </Modal.Title> 
            </Modal.Header>
            <Modal.Body> 
                <p>
                    Highlighted below are the modules section and the badges podium. You can start programming immediately
                    by clicking on any of the modules below. We cover a broad range of topics to help you understand 
                    programming better and make learning more intuitive. 
                    </p>
                    <p>
                    You can collect badges as you progress through the various topics we have to offer. You can compete with your 
                    peers to see who can get the most badges! 
                    </p>
                    <p>
                    Happy Coding!
                </p>
            </Modal.Body>
          </Modal>
        );
    }

    if (openedModule) {
        return (
            <div class="d-flex flex-row justify-content-between">
                <div className={editorState === 0 ? "flex-grow-1 col-100" : "flex-grow-1 col-7"}>
                    <OpenModuleComponent title={openedModule} />
                </div>
                {getEditor()}
                <div className="px-5 mt-5">
                    <BadgesComponent></BadgesComponent>
                </div>
            </div>
        )
    } else {
        return (
            <div class="home_background">
            <div className="container mx-auto pt-4">
                <div class="d-flex justify-content-between">
                        <div className="flex-grow-1">
                            <button type="button" onClick={() => setModalHowToShow(true)} class="btn btn-secondary mt-2 mb-4">How to Play</button>
                            <HowToModal
                                show={modalHowToShow}
                                title={"How To Play!"}
                                onHide={() => setModalHowToShow(false)}
                            />
                        </div>
                        
                        <div className="flex-shrink-1">
                            <h5 class="mt-2 mb-4 text-secondary">
                                <div class="d-flex justify-content-between" onload = {show_point()}>
                                    <div id = "p" className = "point me-2"></div> 
                                    <FontAwesomeIcon icon="fa-solid fa-coins" />
                                </div>
                            </h5>
                        </div>
                </div>
                <div class="d-flex flex-row justify-content-between">
                    <div className="flex-grow-1">
                        <div className="row mb-3">
                            <div className="col d-flex justify-content-center">
                                <h2>Topics</h2>
                            </div>
                        </div>
                        <div class="row p-4" >
                            <div class="col-sm-6">
                                <div href="#" class="card modules_card" module="conditional-statements" onClick={handleModuleStart}>
                                    <div class="card-body">
                                        <h1 class="d-flex justify-content-center mb-3"><FontAwesomeIcon icon="fa-solid fa-code-branch" /></h1>
                                        <h5 class="card-title">Conditional Statements</h5>
                                        <p class="card-text">This module covers conditional statements.</p>
                                        <span className="profile-modules-progress">
                                            <div className="progress">
                                                <div className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div href="#" class="card modules_card" module="conditional-statements" onClick={handleModuleStart}>
                                    <div class="card-body">
                                        <h1 class="d-flex justify-content-center mb-3"><FontAwesomeIcon icon="fa-solid fa-rotate-left" /></h1>
                                        <h5 class="card-title">Loops</h5>
                                        <p class="card-text">This module covers while loops and for loops.</p>
                                        <span className="profile-modules-progress">
                                            <div className="progress">
                                                <div className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3 p-4" >
                            <div class="col-sm-6">
                                <div href="#" class="card modules_card" module="conditional-statements" onClick={handleModuleStart}>
                                    <div class="card-body">
                                        <h1 class="d-flex justify-content-center mb-3"><FontAwesomeIcon icon="fa-brands fa-github" /></h1>
                                        <h5 class="card-title">Example topic</h5>
                                        <p class="card-text">This module covers example topic.</p>
                                        <span className="profile-modules-progress">
                                            <div className="progress">
                                                <div className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div href="#" class="card modules_card" module="conditional-statements" onClick={handleModuleStart}>
                                    <div class="card-body">
                                        <h1 class="d-flex justify-content-center mb-3"><FontAwesomeIcon icon="fa-solid fa-list" /></h1>
                                        <h5 class="card-title">Another example topic</h5>
                                        <p class="card-text">This module covers another axample topic.</p>
                                        <span className="profile-modules-progress">
                                            <div className="progress">
                                                <div className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="ps-5 mt-5">
                        <BadgesComponent></BadgesComponent>
                    </div>
                </div>
            </div>
            </div>
        )
    }
}