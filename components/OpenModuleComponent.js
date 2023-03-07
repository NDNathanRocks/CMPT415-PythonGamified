import { useEffect, useState, useContext, memo } from 'react'
import { giveStudentScore, getStudentAnswers, solvedQuestionCheck, solvedQuestionUpdate, getStudentScore, takeStudentScore } from '../data/Students'
import { getQuizQuestionById, getAllConditionalStatements } from '../data/QuizQuestions'
import { getPersonalization } from "../data/Personalization"
import PersonalizationComponent from './PersonalizationComponent'
import { useFormik } from 'formik'
import Context from '../context/Context'
import SyntaxHighlighter from 'react-syntax-highlighter'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import RecentActivityComponent from './RecentActivityComponent'
import conditionalStatementsJson from '../modules/conditional_statements.json'
import EditorComponent from './EditorComponent'
import EasyEditorComponent from './EasyEditorComponent'
import LeaderboardComponent from './LeaderboardComponent'
import { Student, getStudent, createStudent } from '../data/Students'
import validator from 'validator'
import { v4 as uuidv4 } from "uuid"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, sendSignInLinkToEmail, UserCredential } from "firebase/auth"
import { auth } from '../firebase'
import { v4 } from 'uuid'
import { Quiz } from '../data/Quiz'
import { Pages } from '../context/Pages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'


/**
 * Component for a module's contents and multiple choice questions.
 * @param {*} props 
 * @returns HTML for a module's contents.
 */
function OpenModuleComponent(props) {
    library.add(fab, fas, far)
    const moduleJson = props.file.json

    const moduleName = props.file.id

    let questionsForm = null

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

    // State for estimated lesson time
    const [lessonTime, setLessonTime] = useState('')

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

    // Load personalization
    useEffect(() => {
        getPersonalization(user.uuid).then(p => {
            setPersonalization(p)
        })
    }, [])

    // Load module contents
    useEffect(() => {
        handleModuleStart()
        calculateLessonTime()
        handlePagination()
    }, [currentPage])

    useEffect(() => {
        handleModuleStart()
        calculateLessonTime()
        handlePagination()
    }, [currentMenu])

    useEffect(() => {
        handleModuleStart()
        calculateLessonTime()
        handlePagination()
    }, [showLecture])

    useEffect(() => {
        retrieveStudentAnswers()
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
            const checked = solvedQuestionCheck(user, moduleName, currentPage)
            solvedQuestionUpdate(user, moduleName, currentPage)

            show_related()
            if (pick === String(questions[currentQuestion].correctAnswerIndex)) {
                setCurrentExplanation("✓ " + questions[currentQuestion].explanation)
                checked.then(value => {
                    console.log("Value", value)
                    if(!value) {
                        giveStudentScore(user, 50)
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
            } else {
                if (values.options.length > 2) {
                    formik.setSubmitting(false)
                }
                setCurrentExplanation("❌ " + questions[currentQuestion].explanation)
                setWrongQuestions(wrongQuestions + 1)

                if (wrongQuestions + 1 >= questions.length && showPersonalization === null) {
                    setShowPersonalization(true)
                }
            }
        },
    })

    const createForm = () => {
        if (questions.length > 0 && currentQuestion < questions.length) {
            questionsForm = (
                <div id="mc-question-box">
                    <h3>Multiple-Choice Question</h3>
                    <div class = "code-toolbox">
                    <form onSubmit={formik.handleSubmit}>
                        {
                            questions[currentQuestion].question.map((q, index) => {
                                if (q.type === "code") {
                                    return (
                                        <SyntaxHighlighter language="javascript">
                                            {q.value}
                                        </SyntaxHighlighter>
                                    )
                                } else {
                                    return (
                                        <p>{q.value}</p>
                                    )
                                }
                            })
                        }
                        <br />
                        <div className="row d-flex align-items-end">
                            <div className="col">
                                <div role="group">
                                {
                                    questions[currentQuestion].answers.map((q, index) => {
                                        return (
                                            <div key={index} className="radio-group">
                                                <input id = "radio-check" type="radio" className="form-check-input" disabled={formik.isSubmitting} name="picked" value={index} onChange={formik.handleChange} />
                                                <span className="form-check-label">{q}</span>
                                            </div>
                                        )
                                    })
                                }
                                </div>
                                <br/>
                                <button className="btn btn-success btn-block" type="submit" disabled={formik.isSubmitting}>Submit</button>
                            </div>
                            <div className="col">
                                <div onload = {show_point()}>
                                    <div id = "p" className = "point"></div>
                                    <div className = "pointdescription">10 Coins are need to use a hint.</div>
                                </div>
                                <button className="btn btn-warning mt-3" type="button">Hint</button>
                            </div>
                            <div className="col">
                                <p>{currentExplanation !== "" ? currentExplanation : ""}</p>
                                <button className="btn btn-primary" hidden={!formik.isSubmitting || currentQuestion + 1 >= questions.length} onClick={nextQuestion}>Next question</button>
                            </div>
                        </div>
                    </form>
                    </div>
                </div>
            )
        }
    }


    /**
     * Returns the current page's module contents.
     * @returns HTML for the module's contents.
     */
    const getCurrentMenuBody = () => {
        const currentMenuBody = moduleJson.body.find(body => body.page === currentMenu)

        if (currentMenuBody) {
            return currentMenuBody.content
        }

        return []
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
            // console.log("Here")
            console.log(page)
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
        document.getElementById("radio-check").checked = false;
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

        // const question = getQuizQuestionById("JCtD3zFyLKJsq8yOA52l")
        // console.log("Module start")
        // console.log(question)
        // console.log(question[0])

        getQuizQuestionById("JCtD3zFyLKJsq8yOA52l").then(question => {
            // console.log("Testttt")
            // console.log(question)
            
        })

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

        // console.log("Test all")
        // console.log(getAllConditionalStatements())

        for (let i = 0; i < mcqs.length; i++) {
            const mcq = mcqs[i]
            const question = {
                id: mcq.id,
                question: mcq.question,
                answers: mcq.answers,
                correctAnswerIndex: mcq.correctAnswerIndex,
                explanation: mcq.explanation,
            }

            tempQuestions.push(question)
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
        setQuestions(tempQuestions)
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
        console.log("here in openQuiz")
        setEditorState(0)

        document.getElementById("quiz_box").style.display = "block";
    }

    /**
     * Estimates the time it takes to read the lecture notes.
     */
    const calculateLessonTime = () => {
        let text = ''

        for (let i = 0; i < elements.length; i++) {
            text += elements[i].innerText
        }

        text = text.replace(/<[^>]+>/g, '')

        // Average adult is 225wpm; since this is coding, we will go
        // with a lower wpm
        const wpm = 185
        const words = text.trim().split(/\s+/).length
        const time = Math.ceil(words / wpm)
        setLessonTime(time + " minute(s)")
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
     * Sets the module's personalization
     * @param {*} value 
     */
    const setModulePersonalization = (value) => {
        if (value) {
            setShowLecture(value)
            setShowPersonalization(false)
            handleModuleStart()
            setCurrentPage(currentPage)
            setCurrentMenu(currentPage)
        } else {
            setShowPersonalization(false)
        }
    }

    /**
     * Retrieves student answers (INCOMPLETE)
     */
    const retrieveStudentAnswers = () => {
        const q = questions[currentQuestion]

        if (!q) {
            return
        }
        console.log("Getting q: " + q.id)

        getStudentAnswers(user, q.id).then(answers => {
            console.log(answers)
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
        refreshFormik()
    }

    if (elements.length === 0) {
        return (<Skeleton count={5}></Skeleton>)
    }


    getAllConditionalStatements().then(allQuestions => {
        for (let i = 0; i < allQuestions.length; i++) {
            const mcq = allQuestions[i]
            const question = {
                id: mcq.qid,
                question: mcq.question,
                answers: mcq.answerOptions,
                correctAnswerIndex: mcq.canswerIndex,
                explanation: mcq.explanation,
            }
            // tempQuestions.push(question)
        }

        // setQuestions(tempQuestions)
        
    })
    createForm()

    const { openedModule, setEditor, editorState } = useContext(Context)
    const handleEditorStart = (e) => {
        const module = e.currentTarget.getAttribute('module')
        let content;
        
        // ToDo: Load all modules in modules folder

        if (module === 'conditional_statements') {
            content = conditionalStatementsJson
        } else {
            return
        }
        setOpenedModule({
            id: module,
            json: content
        })
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
        console.log("here")
    }

    function show_point() {
        currentScore.then((value) => {
            document.getElementById('p').innerHTML =  'Current Coins: ' + value + ' </p>';
        });
    }
   

    return (
        <div class="d-flex flex-row">
            <div class="bg-primary text-dark bg-opacity-25 rounded ps-2 pt-4 me-5 mb-4">
                <div>
                    <div class="d-flex flex-row justify-content-between rounded sidebar_row px-4 py-2"  id="menu2">
                        <div class="d-flex flex-row justify-content-between" onClick={() => openQuiz()}>
                            <h5>Quiz</h5>
                            <h5 class="ms-2"><FontAwesomeIcon icon="fa-regular fa-pen-to-square" /></h5>
                        </div>
                        <h5 class="ms-5"><FontAwesomeIcon icon="fa-solid fa-chevron-right"/></h5>
                    </div>
                    <div class="d-flex flex-row justify-content-between rounded sidebar_row px-4 py-2" id="menu3">
                        <div class="d-flex flex-row justify-content-between" onClick={() => openCodingChallenge(1)}>
                            <h5>Challenge</h5>
                            <h5 class="ms-2"><FontAwesomeIcon icon="fa-solid fa-brain" /></h5>
                        </div>
                        <h5 class="ms-5"><FontAwesomeIcon icon="fa-solid fa-chevron-right"/></h5>
                    </div>
                </div>
                <div id = "quiz_list" class = "quiz_list3">
                </div> 
            </div>
            <div className="row flex-grow-1" id="quiz_box">  
                <div className = "quiz_box">
                    <br></br>
                    <div className = "quiz_inner_box">
                        <h1>{getPageTitle(currentPage)}</h1>
                        <h5>Question {currentPage + 1}/{moduleJson.body.length} &middot; Estimated time to complete lesson: {lessonTime}</h5>
                        {/* {showPersonalization ? <PersonalizationComponent onClickYes={show_hint} onClickNo={_ => setModulePersonalization(false)} message="Do you want to see some lecture material on this topic?" /> : <></>} */}
                        {elements}
                        {questionsForm}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(OpenModuleComponent)