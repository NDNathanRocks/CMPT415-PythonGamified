import { useEffect, useState, useContext, memo } from 'react'
import { Modal } from "react-bootstrap";
import { giveStudentScore, getStudentAnswers, solvedQuestionCheck, solvedQuestionUpdate, getStudentScore, takeStudentScore, questionHintCheck, questionHintUpdate } from '../data/Students'
import { getAllConditionalStatements } from '../data/QuizQuestions'
import { getPersonalization } from "../data/Personalization"
import { useFormik } from 'formik'
import Context from '../context/Context'
import SyntaxHighlighter from 'react-syntax-highlighter'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Pages } from '../context/Pages'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import SideBar from './SideBarComponent'
// import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'

function HintModal(props) {
    const [hint, setHint] = useState('')
    
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

/**
 * Component for a module's contents and multiple choice questions.
 * @param {*} props 
 * @returns HTML for a module's contents.
 */
function OpenModuleComponent(props) {
    library.add(fab, fas, far)
    const moduleJson = props.file.json

    const moduleName = props.file.id

    // Context: user, editor state, challenge data, personalization, toast
    const { user, page, setPage, setEditorState, setChallengeData, personalization, setPersonalization, setToast } = useContext(Context)

    const currentScore = getStudentScore(user)

    // State for the module's contents
    const [elements, setElements] = useState([])

    // State for the current page of the module
    const [currentPage, setCurrentPage] = useState(0)

    // State for the current Menu of the module
    const [currentMenu, setCurrentMenu] = useState(0)

    // State for pagination HTML
    const [pagination, setPagination] = useState([])

    // State for lecture visibility
    const [showLecture, setShowLecture] = useState(false)

    // State for multiple choice questions
    const [questions, setQuestions] = useState([])

    // State for the currently open multiple choice question
    const [currentQuestion, setCurrentQuestion] = useState(0)

    // State for the current explanation for the multiple choice question
    const [currentExplanation, setCurrentExplanation] = useState('')

    // State for incorrect questions
    const [wrongQuestions, setWrongQuestions] = useState(0)

    // State for personalization (lecture visibility, etc.)
    const [showPersonalization, setShowPersonalization] = useState(null)

    // State for the current explanation for the multiple choice question
    const [code, setCode] = useState('')

    // State for the current hint for the multiple choice question
    const [hint, setHint] = useState('')

    const [modalShow, setModalShow] = useState(false);

    // State for showing next question button
    const [showNextBtn, setShowNextBtn] = useState(false)
    
    // State for SideBar
    const [sideStr, setSideStr] = useState("quiz")

    // Load personalization and questions
    useEffect(() => {
        getPersonalization(user.uuid).then(p => {
            setPersonalization(p)
        })
        getQuestions()
    }, [])

    // Once questions have been loaded, then display in form
    useEffect(() => {
        createForm()
    }, [questions])

    // Load module contents
    useEffect(() => {
        handleModuleStart()
        handlePagination()
    }, [currentPage])

    useEffect(() => {
        handleModuleStart()
        handlePagination()
    }, [currentMenu])

    useEffect(() => {
        handleModuleStart()
        handlePagination()
    }, [showLecture])

    useEffect(() => {
        retrieveStudentAnswers()
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
            show_related()

            var setDisable = false;
            if (pick === String(questions[currentQuestion].correctAnswerIndex)) {
                setCurrentExplanation("✓ " + questions[currentQuestion].explanation)
                checked.then(value => {
                    // If question has never been solved before, give points and update question status
                    if(!value) {
                        giveStudentScore(user, 50)
                        solvedQuestionUpdate(user, moduleName, currentQuestion, true)
                        setToast({
                            title: "Correct!",
                            message: "⭐ +50 score"
                        })
                    }
                    else {
                        setToast({
                            title: "Good for trying again!",
                            message: "Let's Go!😀"
                        })
                    }
                })
                values.picked = ''
                setShowNextBtn(true)

                // If last question is right, disable form from submitting (student has finished the quiz)
                if (currentQuestion >= (questions.length - 1)) {
                    setDisable = true;
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

    const createForm = () => {
        if (questions.length > 0 && currentQuestion < questions.length) {
            var formQuestion = document.getElementById("quiz_question");
            var formCode = document.getElementById("quiz_code");
            
            const quizQuestion = questions[currentQuestion].question;
            const quizCode = questions[currentQuestion].code;
            const quizAnswerOptions = questions[currentQuestion].answers;
            formQuestion.innerHTML = `${quizQuestion}`;
            
            setCode(quizCode.replaceAll('\\n', '\n'));

            for (let i = 0; i < 6; i++) {
                if (i < quizAnswerOptions.length) {
                    var currentLabel = document.getElementById(`label-${i}`);
                    currentLabel.innerHTML = ` ${quizAnswerOptions[i]}`
                } else {
                    var currentRadio = document.getElementById(`radio-check-${i}`);
                    currentRadio.style.display = "none";
                }
            }

            setHint(questions[currentQuestion].hint)
            
        }
    }

    const getQuestions = () => {
        getAllConditionalStatements().then(allQuestions => {
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
     * Returns the current page's module contents.
     * @returns HTML for the module's contents.
     */
    const getCurrentPageBody = () => {
        const currentPageBody = moduleJson.body.find(body => body.page === currentPage)

        if (currentPageBody) {
            return currentPageBody.content
        }

        return []
    }

    /**
     * Returns the current page's multiple choice questions
     * @returns Multiple choice questions HTML
     */
    const getCurrentPageMcqs = () => {
        const currentPageObject = moduleJson.body.find(body => body.page === currentPage)

        if (currentPageObject) {
            return currentPageObject.mcqs
        }

        return []
    }

    /**
     * @param {Number} page 
     * @returns {String} title of page
     */
    const getPageTitle = (page) => {
        const pageTitle = moduleJson.body.find(body => body.page === page)

        if (pageTitle) {
            return pageTitle.name
        }

        return '...'
    }

        /**
     * Handles a page change.
     * @param {Number} page 
     */
         const menu_select = (page) => {
            var menu1 = document.getElementById("menu1")
            var menu2 = document.getElementById("menu2")
            var menu3 = document.getElementById("menu3")
            var menu = [menu1, menu2, menu3]
            menu[page].classList = "active"
            for (let i = 0; i < menu.length; i++) {
                if (i != page) {
                    if (menu[i].classList == "active") {
                        menu[i].classList.toggle("active")
                    }
                }
            }
            if(page == 0) {
                document.getElementById("quiz_list").style.visibility = "hidden";
            }
            if(page == 2) {
                document.getElementById("quiz_list").style.visibility = "hidden";
            }
            if (page == 1) {
                document.getElementById("quiz_list").style.visibility = "visible";
            }
        }

        

    /**
     * Handles a page change.
     * @param {Number} page 
     */
    const handlePageChange = (page, resetForm) => {
        // document.getElementById("quiz_list").style.visibility = "visible";
        // window.location.reload()
        {hide_hint2}
        // document.getElementById("radio-check").checked = false
        // const radioButtons = document.querySelectorAll('input[id="radio-check"]')
        // radioButtons.checked = false
        refreshFormik()
        resetForm()
        // let radios = document.getElementsByTagName('radio-check');
        // console.log(radios.length)
        // for(let i = 0; i < radios.length; i++) {
        //     // radios[i].onclick = function(e) {
        //     if(e.ctrlKey) {
        //         this.checked = false;
        //     }
        // // }
        // }
        // if selected page is quiz, then keep it into quiz
        if (page == 0 || page == 1 || page == 2) {
            menu_select(1)
        }
        console.log(page)
        // menu_select(page+2)
        if (page < 0) {
            page = 0
        }

        if (page >= moduleJson.body.length) {
            page = moduleJson.body.length - 1
        }

        setShowLecture(false)
        setWrongQuestions(0)
        setCurrentQuestion(0)
        setCurrentPage(page)
        setCurrentMenu(page)
    }

    /**
     * Refreshes the Formik form.
     */
    const refreshFormik = () => {
        formik.resetForm({})
        for (let i = 0; i < 6; i++) {
            var currentRadio = document.getElementById(`radio-check-${i}`);
            currentRadio.checked = false;
        }
        document.getElementsByClassName("form-check-input").checked = false;
        formik.setFieldValue('picked', '')
        // if (matchId) { // If record exists
        //     await resetForm({ values }); // sets dirty false
        // } else { // otherwise
        //     const newValues = { ...values, matchId: results.data.matchId }; // augment with db id
        //     await resetForm({ values: newValues }); // sets dirty false
        // }
        setCurrentExplanation('')
    }

    /**
     * Handles the pagination.
     */
    const handlePagination = () => {
        const pageList = []
        if (currentPage !== 0) {
            pageList.push(
                <a class="prev" href="#" tabindex="-1" id = "prev01" onClick={() => handlePageChange(currentPage - 1, formik.resetForm)}>Prev</a>
            )
        }
        else {
            pageList.push(
                <a class="prev_disabled" href="#" id = "prev02" tabindex="-1" onClick={() => handlePageChange(currentPage - 1, formik.resetForm)}>Prev</a>
            )
        }
        pageList.push(<a class = "bottom_page" id = "page_number" disabled=""> Page {currentPage + 1}/{moduleJson.body.length} </a>)

        if (currentPage !== moduleJson.body.length - 1) {
            pageList.push(
                <a class="next" id = "next01" href="#" onClick={() => handlePageChange(currentPage + 1, formik.resetForm)}>Next</a>
            )
        }
        else {
            pageList.push(
                <a class="next_disabled" id = "next02" href="#" onClick={() => handlePageChange(currentPage + 1,formik.resetForm)}>Next</a>
            )
        }
        setPagination(pageList)
    }

    /**
     * Handles a module being started.
     */
    const handleModuleStart = () => {
        // Parse the module's body
        const moduleBody = getCurrentPageBody()
        let divs = []
        let incompleteChallenges = []

        if (personalization === null) {
            getPersonalization(user.uuid).then(p => {
                setPersonalization(p)
            })
        }

        // get all id's from personalization
        // const personalizationIds = personalization.challenges || []
        // #############################################################
        const personalizationIds = []
        // #############################################################

        // loop through each element in the module body
        for (let i = 0; i < moduleBody.length; i++) {
            const getChallenge = loadAllChallenges(moduleBody, i)

            if (getChallenge !== null) {
                if (!personalizationIds.includes(getChallenge.id)) {
                    incompleteChallenges.push(getChallenge)
                }
            }
        }

        const mcqs = getCurrentPageMcqs()
        const tempQuestions = []

        for (let i = 0; i < mcqs.length; i++) {
            const mcq = mcqs[i]
            const question = {
                id: mcq.id,
                question: mcq.question,
                answers: mcq.answers,
                correctAnswerIndex: mcq.correctAnswerIndex,
                explanation: mcq.explanation,
            }

            // tempQuestions.push(question)
        }

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
        // setQuestions(tempQuestions)
        setElements(divs2)

        const randomChallenge = incompleteChallenges[Math.floor(Math.random() * incompleteChallenges.length)]

        setChallengeData({
            id: randomChallenge.id,
            code: randomChallenge.code,
            question: randomChallenge.value
        })

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
     * Returns all challenges in the module.
     * @param {[String]} moduleBody 
     * @param {Number} index 
     * @returns Challenges object
     */
    const loadAllChallenges = (moduleBody, index) => {
        const element = moduleBody[index]

        if (element['type'] === 'challenge') {
            const c = {
                id: element['id'],
                value: element['value'],
                code: element['code'],
            }

            return c
        }

        return null
    }


    /**
     * Retrieves student answers (INCOMPLETE)
     */
    const retrieveStudentAnswers = () => {
        const q = questions[currentQuestion]

        if (!q) {
            return
        }

        getStudentAnswers(user, q.id).then(answers => {
            // console.log(answers)
            // ToDo: Load saved answers into Formik
            //formik.picked = answers.answers[0] | ''
            //formik.isSubmitting = true
        })
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


          /**
     * Sends an email to the user with a link to reset their password
     * @param {Event} e 
     */
           const hide_hint2 = (e) => {
            document.getElementById("mc-question-box3").style.display = "block";
            document.getElementById("mc-question-box2").style.display = "none";
        }
    

    const show_related = () => {
        
    }

    function show_point() {
        currentScore.then((value) => {
            document.getElementById('p').innerHTML =  'Current Coins: ' + value + ' </p>';
        });
    }
   

    const displayHint = () => {
        const hintChecked = questionHintCheck(user, moduleName, currentQuestion)
        hintChecked.then(value => {
            // If hint has not been bought before, reduce user score
            if (!value) {
                takeStudentScore(user, 10)
            }
        })
        questionHintUpdate(user, moduleName, currentQuestion, true)
        setModalShow(true)
    }

    const sideOut = (theStr) => {
        if (theStr == "quiz") {
            openQuiz()
        } else {
            openCodingChallenge(1)
        }
    }

    return (
        <div class="d-flex flex-row">
            <div>
                <div class="bg-primary text-dark bg-opacity-25 rounded ps-2 pt-4 me-5 mb-4">
                    <div>
                        <div class="d-flex flex-row justify-content-between rounded sidebar_row px-4 py-2"  id="menu2">
                            <SideBar sideOut={sideOut}/>
                        </div>
                    </div>
                <div id = "quiz_list" class = "quiz_list3">
                </div> 
                </div>
            </div>
            <div className="row flex-grow-1" id="quiz_box">  
                <div className = "quiz_box">
                    <br></br>
                    <div className = "quiz_inner_box">
                        <h1>{getPageTitle(currentPage)}</h1>
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
                                        <div id = "p" className = "point"></div>
                                        <div className = "pointdescription">10 Coins are need to use a hint.</div>
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
                show={modalShow}
                title={currentQuestion + 1}
                body={hint}
                onHide={() => setModalShow(false)}
            />
        </div>
    )
}

export default memo(OpenModuleComponent)