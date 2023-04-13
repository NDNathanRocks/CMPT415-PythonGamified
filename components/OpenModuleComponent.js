import { useEffect, useState, useContext, memo } from 'react'
import { Modal } from "react-bootstrap";
import { giveStudentScore, solvedQuestionCheck, solvedQuestionUpdate, getStudentScore, takeStudentScore, questionHintCheck, questionHintUpdate, getModuleBonus, moduleBonusReceived } from '../data/Students'
import { getAllModuleQuestions } from '../data/QuizQuestions'
import { getPersonalization } from "../data/Personalization"
import { useFormik } from 'formik'
import Context from '../context/Context'
import SyntaxHighlighter from 'react-syntax-highlighter'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Pages } from '../context/Pages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import SideBar from './SideBarComponent'
// import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'

function HintModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Hint - Question {props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{props.body}</p>
        </Modal.Body>
      </Modal>
    );
  }

function CompletedModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            <h2 class="mt-3">🎉 Congratulations! 🎉</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>You have completed all questions in the <b>{props.title}</b> module!</h5>
          <p>You may redo this quiz any time for review.</p>
        </Modal.Body>
      </Modal>
    );
}

/**
 * Component for a module's contents and multiple choice questions.
 * @param {*} props 
 * @returns HTML for a module's contents.
 */
function OpenModuleComponent(props) {
    library.add(fab, fas, far)

    const moduleName = props.title

    // Context: user, editor state, challenge data, personalization, toast
    const { user, page, setPage, setEditorState, setChallengeData, challengeData, personalization, setPersonalization, setToast, setOpenedModule } = useContext(Context)

    const currentScore = getStudentScore(user)

    // State for the module's contents
    const [elements, setElements] = useState([])

    // State for multiple choice questions
    const [questions, setQuestions] = useState([])

    // State for the currently open multiple choice question
    const [currentQuestion, setCurrentQuestion] = useState(0)

    // State for the current explanation for the multiple choice question
    const [currentExplanation, setCurrentExplanation] = useState('')

    // State for incorrect questions
    const [wrongQuestions, setWrongQuestions] = useState(0)

    // State for number of correct questions in a row
    const [answerStreak, setAnswerStreak] = useState(0)

    // State for personalization (lecture visibility, etc.)
    const [showPersonalization, setShowPersonalization] = useState(null)

    // State for the current explanation for the multiple choice question
    const [code, setCode] = useState('')

    // State for the current hint for the multiple choice question
    const [hint, setHint] = useState('')

    // State for the module bonus award amount
    const [bonusAward, setBonusAward] = useState(0)

    // State for whether the module bonus award has previously been received
    const [bonusReceived, setBonusReceived] = useState(false)

    // State for the the visibility of the hint modal
    const [hintModalShow, setHintModalShow] = useState(false);

    // State for the the visibility of the completed modal
    const [completedModalShow, setCompletedModalShow] = useState(false);

    // State for showing next question button
    const [showNextBtn, setShowNextBtn] = useState(false)
    
    // State for SideBar
    const [sideStr, setSideStr] = useState("quiz")

    // Load personalization and questions
    useEffect(() => {
        getPersonalization(user.uuid).then(p => {
            setPersonalization(p)
        })
        handleModuleStart()
        getQuestions()
        getModuleBonusInfo()
        setEditorState(0)
    }, [])

    // Once questions have been loaded, then display in form
    useEffect(() => {
        createForm()
    }, [questions])


    useEffect(() => {
        createForm()
    }, [currentQuestion])

    // Formik form for multiple choice questions
    const formik = useFormik({
        initialValues: {
            prompt: '',
            options: [],
            picked: '',
            explanation: '',
        },
        onSubmit: values => {
            const pick = values.picked
            const checked = solvedQuestionCheck(user, moduleName, currentQuestion)

            var setDisable = false;
            if (pick === String(questions[currentQuestion].correctAnswerIndex)) {
                var bonusCoins = answerStreak * 5
                
                // Standard amount of coins given is 10
                var coinsAwarded = 10

                // Max amount of bonus coins (from answer streaks) is 20
                if (bonusCoins >= 20) {
                    bonusCoins = 20
                }

                coinsAwarded += bonusCoins

                setAnswerStreak(answerStreak+1)
                setCurrentExplanation("✓ " + questions[currentQuestion].explanation)
                checked.then(value => {
                    // If question has never been solved before, give coins and update question status
                    if(!value) {
                        giveStudentScore(user, coinsAwarded)
                        solvedQuestionUpdate(user, moduleName, currentQuestion, true)
                        setToast({
                            title: "Correct!",
                            message: `+${coinsAwarded} score \n Answer Streak: ${answerStreak + 1}🔥`
                        })
                    }
                    else {
                        setToast({
                            title: "Good for trying again!",
                            message: `Answer Streak: ${answerStreak + 1}🔥`
                        })
                    }
                })
                values.picked = ''
                setShowNextBtn(true)

                // If last question is right, disable form from submitting (student has finished the quiz)
                if (currentQuestion >= (questions.length - 1)) {
                    setDisable = true;
                    setCompletedModalShow(true)

                    // If bonus has not been received before, give the student their bonus for completing the module
                    if (!bonusReceived) {
                        setToast({
                            title: "Module Completion Bonus",
                            message: `+${bonusAward} score`
                        })
                        giveStudentScore(user, bonusAward)
                        moduleBonusReceived(user, moduleName)
                    }

                }
            } else if (pick !== ''){
                if (values.options.length > 2) {
                    formik.setSubmitting(false)
                }
                setCurrentExplanation("❌ " + questions[currentQuestion].explanation)
                setWrongQuestions(wrongQuestions + 1)

                if (wrongQuestions + 1 >= questions.length && showPersonalization === null) {
                    setShowPersonalization(true)
                }
            }
            formik.setSubmitting(setDisable)
        },
    })

    /**
     * Fill in form with information of current question as pulled from Firebase
     */
    const createForm = () => {
        if (questions.length > 0 && currentQuestion < questions.length) {
            var formQuestion = document.getElementById("quiz_question");
            var codeBox = document.getElementById("quiz_code");
            
            const quizQuestion = questions[currentQuestion].question.replaceAll('\\n', '\n');
            const quizCode = questions[currentQuestion].code;
            const quizAnswerOptions = questions[currentQuestion].answers;
            formQuestion.innerHTML = `${quizQuestion}`;

            setCode(quizCode.replaceAll('\\n', '\n'));
            
            // If there is no code, hide the code box
            if (!quizCode) {
                codeBox.style.visibility = "hidden";
            // If there is code, make sure it is displayed
            } else {
                codeBox.style.visibility = "visible";
            }

            for (let i = 0; i < 6; i++) {
                var currentLabel = document.getElementById(`label-${i}`);
                if (i < quizAnswerOptions.length) {
                    currentLabel.innerHTML = ` ${quizAnswerOptions[i]}`
                } else {
                    var currentRadio = document.getElementById(`radio-check-${i}`);
                    currentRadio.style.visibility = "hidden";
                    currentLabel.innerHTML = ``
                }
            }

            setHint(questions[currentQuestion].hint)
            
        }
    }

    /**
     * Asynchronously get information about end of module bonus
     */
    const getModuleBonusInfo= () => {
        getModuleBonus(user, moduleName).then(bonusObj => {
            setBonusAward(bonusObj.award)

            var bonusState = true
            if (bonusObj.received === 0) {
                bonusState = false
            }
            setBonusReceived(bonusState)
        })
    }

    /**
     * Asynchronously pull questions from firebase and load them
     */
    const getQuestions = () => {
        getAllModuleQuestions(moduleName).then(allQuestions => {
            let tempQuestions = []
            for (let i = 0; i < allQuestions.length; i++) {
                const mcq = allQuestions[i]
                const question = {
                    id: mcq.qid,
                    question: mcq.question,
                    code: mcq.code,
                    answers: mcq.answerOptions,
                    correctAnswerIndex: mcq.answerIndex,
                    explanation: mcq.explanation,
                    hint: mcq.hint,
                }
                tempQuestions.push(question)
            }
    
            setQuestions(tempQuestions)
            
        })
    }

    /**
     * 
     * @param {String} str 
     * @returns String converted into title case
     */
    function toTitleCase(str) {
        return str.replace(
          /\w\S*/g,
          function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
        );
      }


    /**
     * @returns {String} Properly formatted title of page
     */
    const getPageTitle = () => {
        return toTitleCase(moduleName.replaceAll('-', ' '))
    }

    /**
     * Refreshes the Formik form.
     */
    const refreshFormik = () => {
        formik.resetForm({})
        for (let i = 0; i < 6; i++) {
            var currentRadio = document.getElementById(`radio-check-${i}`);
            currentRadio.checked = false;
            currentRadio.style.visibility = "visible";
        }
        document.getElementsByClassName("form-check-input").checked = false;
        formik.setFieldValue('picked', '')
        setCurrentExplanation('')
    }

    /**
     * Handles a module being started.
     */
    const handleModuleStart = () => {
        let divs2 = null
        divs2 = (
            <div id="mc-question-box2">
                {/* <div id = "mc-question-box-content">
                <h2>Hint</h2>
                {divs}
                <button id = "hide_hint" className = "btn btn-success btn-block" onClick= {hide_hint2} >Hide hint</button>
                </div> */}
            </div>
        )
        setElements(divs2)
    }

    /**
     * Opens a coding challenge. Can be easy or hard.
     * @param {Number} editorType 
     */
    const openCodingChallenge = (editorType) => {
        if (editorType < 0)
            editorType = 0

        if (editorType > 2)
            editorType = 2
        
        setEditorState(editorType)
        setPage(Pages.EDITOR)

        document.getElementById("quiz_box").style.display = "none";
    }

    const openQuiz = () => {
        setEditorState(0)

        document.getElementById("quiz_box").style.display = "block";
    }

    /**
     * Goes to the next multiple choice question.
     */
    const nextQuestion = () => {
        if (currentQuestion + 1 > questions.length) {
            return
        }

        setCurrentQuestion(currentQuestion + 1)
        setShowNextBtn(false)
        refreshFormik()
    }

    if (elements.length === 0) {
        return (<Skeleton count={5}></Skeleton>)
    }


    /*
    * Get and display users current amount of coins
    */
    function show_point() {
        currentScore.then((value) => {
            document.getElementById('p').innerHTML =  'Current Coins: ' + value + ' </p>';
        });
    }
   

    /*
    * Display hint when useer clicks. If they have not bought the hint before, reduce their score accordingly
    */
    const displayHint = () => {
        const hintChecked = questionHintCheck(user, moduleName, currentQuestion)
        hintChecked.then(value => {
            // If hint has not been bought before, reduce user score
            if (!value) {
                takeStudentScore(user, 10)
            }
        })
        questionHintUpdate(user, moduleName, currentQuestion, true)
        setHintModalShow(true)
    }

    const sideOut = (theStr) => {
        if (theStr == "quiz") {
            openQuiz()
        } else {
            openCodingChallenge(1)
        }
    }

    return (
        <div class="d-flex flex-row flex-grow-1 ms-5">
            <SideBar sideOut={sideOut} moduleName={moduleName.replaceAll('-', '_')}/>
            <div class="bg-primary text-dark bg-opacity-25 rounded ps-2 pt-4 me-5 mb-4">
                <div id = "quiz_list" class = "quiz_list3">
                </div> 
            </div>
            <div className="row flex-grow-1" id="quiz_box">  
                <div className = "quiz_box">
                    <br></br>
                    <div className = "quiz_inner_box">
                        <h1>{getPageTitle()}</h1>
                        <h5>Question {currentQuestion + 1}/{questions.length}</h5>
                        {elements}
                        <div id ="quiz_form">
                        <div id="mc-question-box">
                        <div class = "code-toolbox">
                        <form onSubmit={formik.handleSubmit}>
                            <p id="quiz_question">Question</p>
                            <SyntaxHighlighter id="quiz_code" language="python">
                                {code}
                            </SyntaxHighlighter>
                            <br />
                            <div className="row d-flex align-items-end">
                                <div className="col">
                                    <div role="group">
                                    <div key={0} id="answer_options" className="radio-group">
                                        <input id = "radio-check-0" type="radio" className="form-check-input" disabled={formik.isSubmitting} name="picked" value="0" onChange={formik.handleChange} />
                                        <label id="label-0" className="ms-2"></label>
                                        <br/>
                                        <input id = "radio-check-1" type="radio" className="form-check-input" disabled={formik.isSubmitting} name="picked" value="1" onChange={formik.handleChange} />
                                        <label id="label-1" className="ms-2"></label>
                                        <br/>
                                        <input id = "radio-check-2" type="radio" className="form-check-input" disabled={formik.isSubmitting} name="picked" value="2" onChange={formik.handleChange} />
                                        <label id="label-2" className="ms-2"></label>
                                        <br/>
                                        <input id = "radio-check-3" type="radio" className="form-check-input" disabled={formik.isSubmitting} name="picked" value="3" onChange={formik.handleChange} />
                                        <label id="label-3" className="ms-2"></label>
                                        <br/>
                                        <input id = "radio-check-4" type="radio" className="form-check-input" disabled={formik.isSubmitting} name="picked" value="4" onChange={formik.handleChange} />
                                        <label id="label-4" className="ms-2"></label>
                                        <br/>
                                        <input id = "radio-check-5" type="radio" className="form-check-input" disabled={formik.isSubmitting} name="picked" value="5" onChange={formik.handleChange} />
                                        <label id="label-5" className="ms-2"></label>
                                        <br/>
                                    </div>
                                    </div>
                                    <br/>
                                    <button className="btn btn-success btn-block" type="submit" disabled={formik.isSubmitting}>Submit</button>
                                </div>
                                <div className="col">
                                    <div onload = {show_point()}>
                                        <div class="d-flex justify-content-start">
                                            <div id = "p" className = "point me-2"></div>
                                            <FontAwesomeIcon icon="fa-solid fa-coins" />
                                        </div>
                                        <div className = "pointdescription">10 <FontAwesomeIcon icon="fa-solid fa-coins" /> are need to use a hint.</div>
                                    </div>
                                    <button className="btn btn-warning mt-3" type="button" onClick={displayHint}>Hint</button>
                                </div>
                                <div className="col">
                                    <p>{currentExplanation !== "" ? currentExplanation : ""}</p>
                                    <button className="btn btn-primary" hidden={!showNextBtn || currentQuestion + 1 >= questions.length} onClick={nextQuestion}>Next question</button>
                                </div>
                            </div>
                        </form>
                        </div>
                    </div>
                        </div>
                    </div>
                </div>
            </div>
            <HintModal
                show={hintModalShow}
                title={currentQuestion + 1}
                body={hint}
                onHide={() => setHintModalShow(false)}
            />
            <CompletedModal
                show={completedModalShow}
                title={getPageTitle()}
                onHide={() => setCompletedModalShow(false)}
            />
        </div>
    )
}

export default memo(OpenModuleComponent)