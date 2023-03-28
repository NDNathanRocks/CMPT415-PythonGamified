import BadgesComponent from "./BadgesComponent";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useContext } from 'react'
import React, { useState, useEffect } from 'react';
import Context from '../context/Context'
import RecentActivityComponent from './RecentActivityComponent'
import OpenModuleComponent from './OpenModuleComponent'
import EditorComponent from './EditorComponent'
import EasyEditorComponent from './EasyEditorComponent'
import LeaderboardComponent from './LeaderboardComponent'
import SideBar from "./SideBarComponent";
// import Modal from './Modal';
import { Modal } from "react-bootstrap"
import { db } from '../firebase'
import { collection, query, where, getDocs, getDoc, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

export default function HomePageComponent() {
    library.add(fab, fas, far)
    const { openedModule, setOpenedModule, editorState, setChallengeQuestion } = useContext(Context)
    const chalQuestionsRef = collection(db, "quiz-questions/conditional-statements/challenge")

    useEffect(() => {
        // get questions from firebase:
        const readFireBaseData = () => {

            const getQuestionsList = async() => {
                const data = await getDocs(chalQuestionsRef);
                const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
                setChallengeQuestion(filteredData);
            };
        
            // getQuestionsList()

            setChallengeQuestion([
                {question: "Write a program that prints 'x' if the number inside the variable 'x' is greater than 5.",
                    answer: "7",
                    hint: "Use an if statement to check if x > 5, this way you can compare x with the number 5 and see if its greater than or not.\nThen you can use the print statment inside the if statement by creating an indentation in the next line.",
                    title: "If Statement (easy)",
                    output: "my old output1 goes here",
                    completed: false
                },
                {question: "For Loop Question 2",
                    answer: "me2",
                    hint: "hint2",
                    title: "If Statement (med)",
                    output: "my old output2 goes here",
                    completed: false
                },
                {question: "Nested For Loop Question 3",
                    answer: "me3",
                    hint: "hint3",
                    title: "If Statement (hard)",
                    output: "my old output3 goes here",
                    completed: false
                },
                {question: "Largest Number Question 4 big quesion goes here",
                    answer: "me4",
                    hint: "hint4",
                    title: "While Loop (easy)",
                    output: "my old output4 goes here",
                    completed: true
                },
            ])
        }

        readFireBaseData();
        console.log("Home Page Mounted!")
    }, [])

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
            <div className="container mx-auto ">
                <div class="d-flex justify-content-between">
                        <div className="flex-grow-1">
                            <button type="button" onClick={() => setModalHowToShow(true)} class="btn btn-success mt-2 mb-4">How to Play</button>
                            <HowToModal
                                show={modalHowToShow}
                                title={"How To Play!"}
                                onHide={() => setModalHowToShow(false)}
                            />
                        </div>
                        
                        <div className="flex-shrink-1">
                            <h5 class="mt-2 mb-4">12 <FontAwesomeIcon icon="fa-solid fa-coins" /></h5>
                        </div>
                </div>
                <div class="d-flex flex-row justify-content-between">
                    <div className="flex-grow-1">
                        <div className="row">
                            <div className="col">
                                <h3 class="mb-3">Topics</h3>
                            </div>
                        </div>
                        <div class="row" >
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
                    </div>
                    
                    <div className="ps-5 mt-5">
                        <BadgesComponent></BadgesComponent>
                    </div>
                </div>
            </div>
        )
    }
}