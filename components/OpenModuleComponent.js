import { useEffect, useState, useContext, memo } from 'react'
import { giveStudentScore, getStudentAnswers, solvedQuestionCheck, solvedQuestionUpdate, getStudentScore, takeStudentScore } from '../data/Students'
import { getQuizQuestionById } from '../data/QuizQuestions'
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
import SideBar from './SideBarComponent'
// import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'

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

    // State for SideBar
    const [sideStr, setSideStr] = useState("quiz")

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
            getQuizQuestionById("JCtD3zFyLKJsq8yOA52l")

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
            // menu1.classList.toggle("active")
            // menu2.classList.toggle("acitve")
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
        // for (let i = 0; i < moduleJson.body.length; i++) {
            
            // if (i === currentPage) {
            //     pageList.push(
            //         <li key={i}>
            //             <a className="button-8" href="#" onClick={() => handlePageChange(i)}>
            //                 Current Page
            //             </a>
            //         </li>
            //     )

            //     continue
            // }

            // if (i === moduleJson.body.length - 1) {
            //     pageList.push(
            //         <li className="page-item" key={i}>
            //             <a className="page-link" href="#" onClick={() => handlePageChange(i)}>
            //                 {getPageTitle(i)}
            //             </a>
            //         </li>
            //     )

            //     continue
            // }
        // }

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
            divs.push(transformJsonToHtml(moduleBody, i, showLecture))
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

            tempQuestions.push(question)
        }
        // console.log(typeof divs)
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
     * Transforms the module json to html.
     * @param {Object} moduleBody 
     * @param {Number} index 
     * @param {Boolean} addContent 
     * @returns HTML representation of JSON elements in module.
     */
    const transformJsonToHtml = (moduleBody, index, addContent) => {
        let divs = []
        
        const element = moduleBody[index]
        // If the element is a header element, add it to the html
        if (element['type'] === 'header' && addContent) {
            divs.push(
                <h3>{element['value']}</h3>
            )
        }
        // console.log(element)
        // if (element['type'] == '')

        // If the element is a html element, add it to the html
        if (element['type'] === 'html' && addContent) {
            divs.push((
                <span>{element['value']}<br/></span>
            ))
        }

        // If the element is a code element, add it to the html
        if (element['type'] === 'code' && addContent) {
            const value = element['value']
            divs.push(
                <div id="code-editor-box">
                    <SyntaxHighlighter language="javascript">
                        {value}
                    </SyntaxHighlighter>
                </div>
            )
        }

        // If the element is a image element, add it to the html
        if (element['type'] === 'image' && addContent) {
            divs.push(
                <div className="module-image">
                    <img src={element['value']} />
                </div>
            )
        }
        return divs
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

    let questionsForm = null

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
        const show_hint = (e) => {
            setModulePersonalization(true)
            document.getElementById("mc-question-box3").style.display = "none";
            document.getElementById("mc-question-box2").style.display = "block";
            document.getElementById("hide_hint").style.visibility = "hidden"
        }
    
        /**
     * Sends an email to the user with a link to reset their password
     * @param {Event} e 
     */
         const show_hint2 = (e) => {
            // console.log({currentScore})
            currentScore.then(value => {
                // console.log(value);
                // console.log(typeof value)
                var point = parseInt(value)
                const checked = solvedQuestionCheck(user, moduleName, currentPage)
                console.log(checked)
                checked.then(value => {
                    console.log("CHECKED: ", value)
                    if(value) {
                        console.log("free?", value)
                        setToast({
                            title: "Good job for trying again",
                            message: "⭐ Hint is freely offered"
                        })
                        setModulePersonalization(true)
                        // e.preventDefault()
                        console.log("here")
                        document.getElementById("mc-question-box3").style.display = "none";
                        document.getElementById("mc-question-box2").style.display = "block";
                    }
                    else {
                        if(point >= 10) {
                            takeStudentScore(user, 10)
                            setToast({
                                title: "Open the hint with the point!",
                                message: "⭐ -10 score"
                            })
                            setModulePersonalization(true)
                        // e.preventDefault()
                        console.log("here")
                        document.getElementById("mc-question-box3").style.display = "none";
                        document.getElementById("mc-question-box2").style.display = "block";
                        }
                        else {
                            setToast({
                            title: "You don't have enought point!",
                            message: "⭐ Need at least 10 points"
                            })
                        }
                    }
                })
              });
            
        }

      /**
     * Sends an email to the user with a link to reset their password
     * @param {Event} e 
     */
       const hide_hint = (e) => {
        setShowLecture(false)
        setModulePersonalization(false)
        // e.preventDefault()
        console.log("here")
        document.getElementById("mc-question-box").style.visibility = "visible"
        if (document.getElementById("prev01")!=null) {
            document.getElementById("prev01").style.visibility = "visible"
        }
        if (document.getElementById("prev02")!=null) {
            document.getElementById("prev02").style.visibility = "visible"
        }
        if (document.getElementById("next01")!=null) {
            document.getElementById("next01").style.visibility = "visible"
        }
        if (document.getElementById("next02")!=null) {
            document.getElementById("next02").style.visibility = "visible"
        }
        if (document.getElementById("page_number")!=null) {
            document.getElementById("page_number").style.visibility = "visible"
        }
        // {pagination}
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
    /**
     * @param {Number} page 
     * @returns {String} title of page
     */
    const checking_solved = (page) => {
        const checked = solvedQuestionCheck(user, moduleName, 0)
        const checked1 = solvedQuestionCheck(user, moduleName, 1)
        const checked2 = solvedQuestionCheck(user, moduleName, 2)
        const checked3 = solvedQuestionCheck(user, moduleName, 3)
        const checked4 = solvedQuestionCheck(user, moduleName, 4)
        const checked5 = solvedQuestionCheck(user, moduleName, 5)
        const checked6 = solvedQuestionCheck(user, moduleName, 6)
        const checked7 = solvedQuestionCheck(user, moduleName, 7)
        const checked8 = solvedQuestionCheck(user, moduleName, 8)
        const checked9 = solvedQuestionCheck(user, moduleName, 9)
        const checked10 = solvedQuestionCheck(user, moduleName, 10)
        const checked11 = solvedQuestionCheck(user, moduleName, 11)
        const checked12 = solvedQuestionCheck(user, moduleName, 12)
        const checked13 = solvedQuestionCheck(user, moduleName, 13)
        const checked14 = solvedQuestionCheck(user, moduleName, 14)
        const checked15 = solvedQuestionCheck(user, moduleName, 15)
        const checked16 = solvedQuestionCheck(user, moduleName, 16)
        const checked17 = solvedQuestionCheck(user, moduleName, 17)
        const checked18 = solvedQuestionCheck(user, moduleName, 18)
        const checked19 = solvedQuestionCheck(user, moduleName, 19)
        checked.then((value) => {
            if(value){
                document.getElementById('question1_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question1_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked1.then((value) => {
            if(value){
                document.getElementById('question2_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question2_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked2.then((value) => {
            console.log("checkedededed")
            if(value){
                document.getElementById('question3_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question3_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked3.then((value) => {
            if(value){
                document.getElementById('question4_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question4_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked4.then((value) => {
            if(value){
                document.getElementById('question5_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question5_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked5.then((value) => {
            if(value){
                document.getElementById('question6_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question6_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked6.then((value) => {
            if(value){
                document.getElementById('question7_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question7_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked7.then((value) => {
            if(value){
                document.getElementById('question8_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question8_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked8.then((value) => {
            if(value){
                document.getElementById('question9_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question9_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked9.then((value) => {
            if(value){
                document.getElementById('question10_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question10_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked10.then((value) => {
            if(value){
                document.getElementById('question11_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question11_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked11.then((value) => {
            if(value){
                document.getElementById('question12_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question12_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked12.then((value) => {
            if(value){
                document.getElementById('question13_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question13_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked13.then((value) => {
            if(value){
                document.getElementById('question14_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question14_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked14.then((value) => {
            if(value){
                document.getElementById('question15_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question15_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked15.then((value) => {
            if(value){
                document.getElementById('question16_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question16_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked16.then((value) => {
            if(value){
                document.getElementById('question17_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question17_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked17.then((value) => {
            if(value){
                document.getElementById('question18_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question18_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked18.then((value) => {
            if(value){
                document.getElementById('question19_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question19_check').innerHTML = ' ❌ ' +'</p>';
            }
        });
        checked19.then((value) => {
            if(value){
                document.getElementById('question20_check').innerHTML = ' ✅ ' +'</p>';
            }
            else{
                document.getElementById('question20_check').innerHTML = ' ❌ ' +'</p>';
            }
        });

            
        
    }

    /**
     * @param {Number} page 
     * @returns {String} title of page
     */
    const question_solve_check1 = (page) => {
        const checked = solvedQuestionCheck(user, moduleName, currentPage)
        var text = printChecking()
        console.log("TEXT is HERE")
        console.log(text)
        checked.then(value => {
            // console.log(value)
            if(!value) {
                // <span id = "quiz1" class = "quiz_list"> ❌ </span>
                // return '❌'
                // console.log("quiz1hehiehiehieh")
                text = '❌'
            }
            else {
                // <span id = "quiz1" class = "quiz_list"> ✅ </span>
                // return '✅'
                text = '✅'
                // return 'checked'
                // console.log("hhidfjlaidjfliadj;flijdal;ifjladjf;liasd;j;fl")
            }
        })
        return text
    }

   

    const sideOut = (theStr) => {
        console.log("inside sideout!")
        if (theStr == "quiz") {
            openQuiz()
        } else {
            openCodingChallenge(1)
        }
    }

    return (
        <div>
            <div class="d-flex flex-row">
                <div class="bg-primary text-dark bg-opacity-25 rounded ps-2 pt-4 me-5 mb-4">
                    <div>
                        <div class="d-flex flex-row justify-content-between rounded sidebar_row px-4 py-2"  id="menu2">
                            <SideBar sideOut={sideOut}/>
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
        </div>
    )
}

export default memo(OpenModuleComponent)