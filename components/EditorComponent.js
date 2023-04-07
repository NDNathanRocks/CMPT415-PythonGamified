import Editor from "@monaco-editor/react"
import { useRef, useState, useContext, useEffect  } from 'react'
import Context from '../context/Context'
import axios from 'axios'
import CheckOutputComponent from "./CheckOutputComponent"
// import Modal from "./Modal"
import { Modal } from "react-bootstrap"
import { updateScore, solvedQuestionUpdate, checkHintUsedAndUpdate, updateQuestionData, getScore } from "../data/ChallengeQuestions"
import { get } from "https"
import Button from 'react-bootstrap/Button'
import { getStudentScore } from '../data/Students'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


/**
 * The editor component for coding challenges.
 * @param {*} props 
 * @returns HTML for the editor
 */
export default function EditorComponent(props) {
    const options = {
        fontSize: "14px",
        minimap: { enabled: false }
    }
    
    const { challengeNumber, setChallengeNumber, challengeQuestion, challengeAnswer, user, score, setScore, openedModule, setToast } = useContext(Context)
    
    const moduleName = openedModule.replaceAll('-', '_')

    // State for the code's output
    const [output, setOutput] = useState(["# Your output will be displayed here\n"])

    // State for if the code can be ran right now
    const [runEnabled, setRunEnabled] = useState(true)

    // State for the prompt
    const [prompt, setPrompt] = useState()

    // For RunCode Error Message
    const [errorMessage, setErrorMessage] = useState("")
    const [modalHintShow, setModalHintShow] = useState(false);
    const [modalErrShow, setModalErrShow] = useState(false);
    // const [modalNextQuestionShow, setModalNextQuestionShow] = useState(false);

    // Context used: editor state
    const { setEditorState } = useContext(Context)

    // Ref for the editor element
    const editorRef = useRef()

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor
    }

    /**
     * Closes the editor.
     */
    const closeCodingChallenge = () => {
        setEditorState(0)
    }

    // useEffect(() => {
    //     // setPrompt(challengeData)
        
    // }, [])
    useEffect (()=>{
        console.log("Editor Mounted!")
    }, [])

    useEffect (()=>{
        console.log("Hint Used!")
        const theScore = getScore(user)
        theScore.then(value => {
            setScore(value)
        })
    }, [modalHintShow])

    /**
     * Runs the code and updates the output.
     */
    const runCode = (e) => {
        if (e) e.preventDefault();
        setRunEnabled(false)

        // For now, clearing output
        setOutput([])
        
        const editorText = editorRef.current.getValue()

        var b = Buffer.from(editorText)
        var s = b.toString('base64')   

        // Code is sent to the Rapid API server to be run
        const options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions',
            params: {base64_encoded: 'true', fields: '*'},
            headers: {
              'content-type': 'application/json',
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            data: '{"language_id":71,"source_code":"' + s + '","stdin":"SnVkZ2Uw"}'
          }

          // Send the code to the server
          axios.request(options).then(function (response) {
              const token = response.data.token

              const getOptions = {
                method: 'GET',
                url: 'https://judge0-ce.p.rapidapi.com/submissions/' + token,
                params: {base64_encoded: 'true', fields: '*'},
                headers: {
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                }
              }
              
              axios.request(getOptions).then(function (response2) {
                // Receive output and update state
                const err = response2.data.stderr
                if (err) {
                    const buffErr = Buffer.from(err, 'base64')
                    const message = buffErr.toString('ascii')
                    setErrorMessage(message)
                    setModalErrShow(true)
                } else {
                    setErrorMessage("")
                    setModalErrShow(false)
                }
                const out = response2.data.stdout
                if (out) {
                    const b = Buffer.from(out, 'base64')
                    const s = b.toString('ascii')
                    setOutput([...output, s])
                    afterRun(s)
                    challengeAnswer[moduleName].question_data[challengeNumber].output = s
                } else {
                    const s = ""
                    setOutput([...output, s])
                    afterRun(s)
                    challengeAnswer[moduleName].question_data[challengeNumber].output = s
                }
                challengeAnswer[moduleName].question_data[challengeNumber].mycode = editorVal
                updateQuestionData(user, moduleName, challengeAnswer[moduleName].question_data)
                setRunEnabled(true)
              }).catch(function (error) {
                alert("Error: " + error)
                setRunEnabled(true)
              })

          }).catch(function (error) {
              alert("Error: " + error)
              setRunEnabled(true)
          })
        
    }

    const afterRun = async (s) => {
        if (s.toLowerCase().replace(/(\r\n|\n|\r)/gm, "") === challengeQuestion.find(x => x.id === moduleName).questions[challengeNumber].answer) {
            if (challengeAnswer[moduleName].question_data[challengeNumber].completed == false) {
                if (await solvedQuestionUpdate(user, moduleName, challengeNumber)) {
                    //increase score
                    updateScore(user, 50)
                    setToast({
                        title: "Correct!",
                        message: <div>
                                    <p>⭐ +50 score</p>
                                    <Button variant="success" size="sm" onClick={() => {setChallengeNumber(challengeNumber + 1)}}>Try Next Question</Button>
                                </div>
                        // message: "⭐ +50 score"
                    })
                    // setModalNextQuestionShow(true)
                    challengeAnswer[moduleName].question_data[challengeNumber].completed = true
                } else {
                    setToast({
                        title: "Good for trying again!",
                        message: "Let's Go!😀"
                    })
                }
            } else {
                setToast({
                    title: "Good for trying again!",
                    message: "Let's Go!😀"
                })
            }
        } else {
            setToast({
                title: "Incorrect!",
                message: "Sorry that did not match our expected output. Please try again! 😀"
            })
        } 
    }

    useEffect(() => {
        setOutput([challengeAnswer[moduleName].question_data[challengeNumber].output])
        setEditorVal(challengeAnswer[moduleName].question_data[challengeNumber].mycode)
    }, [challengeNumber])

    /**
    * Modal Stuff
    **/
    function handleOpen(){
        checkHintUsedAndUpdate(user, moduleName, challengeNumber)
        setModalHintShow(true)
    }

    function HintModal(props) {        
        return (
          <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
          >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter"> Hint - Question {props.title} </Modal.Title> 
            </Modal.Header>
            <Modal.Body> <p>{props.body}</p> </Modal.Body>
          </Modal>
        );
    }

    function ErrModal(props) {        
        return (
            <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter"> Error Check - Question {props.title} </Modal.Title> 
            </Modal.Header>
            <Modal.Body> <p>{props.body}</p> </Modal.Body>
            </Modal>
        );
    }

    // function NextQuestionModal(props) {        
    //     return (
    //         <Modal
    //             {...props}
    //             size="lg"
    //             aria-labelledby="contained-modal-title-vcenter"
    //             centered
    //         >
    //         <Modal.Header closeButton>
    //             <Modal.Title id="contained-modal-title-vcenter"> Error Check - Question {props.title} </Modal.Title> 
    //         </Modal.Header>
    //         <Modal.Body> <p>{props.body}</p> </Modal.Body>
    //         </Modal>
    //     );
    // }

    const deduceErrorMessage = () => {
        if (errorMessage == "") {return null}
        
        let text = errorMessage.split("\n");
        let headerText = "Unknown Error";
        let bodyText = "Im sorry, we were not able to figure out the error but you can always search it up on stack overflow! Below you will find the line giving more information about the error."
        // if (text.indexOf("SyntaxError:")) {
        //     headerText = SyntaxError
        // } else if (text.indexOf("SyntaxError:"))
        for (let i = 0 ; i < text.length ; i++) {
            let textSplit = text[i].split(" ");
            if (textSplit.includes("SyntaxError:")) {
                headerText = "Syntax Error!"
                bodyText = "A Syntax Error is a way of Python telling you you've got the grammar error. You might've missed something important for Python to understand the code you have written."
            } else if(textSplit.includes("NameError:")) {
                headerText = "Naming Error!"
                bodyText = "A Naming Error occurs when you call a function or a variable that is not defined/initialized earlier... Please refer back to your code and see if you have misspelt any function/variable names or have not declared them before you called them."
            }
        }
        return (
            <div>
                <p>{headerText}</p>
                <p>{bodyText}</p>
                <p>{errorMessage}</p>
            </div>
        )
    }
    const [editorVal, setEditorVal] = useState(challengeAnswer[moduleName].question_data[challengeNumber].mycode)
    function handleEditorChange(value, event) {
        setEditorVal(value)
      }

    return (
            <div class="codingchall">
                <h1>Coding Challenge</h1>
                <div className="editor-output">
                    <div className="output">
                        <h5>Question {challengeNumber+1} - {challengeQuestion.find(x => x.id === moduleName).questions[challengeNumber].title}</h5>
                        <ul>
                            {challengeQuestion.find(x => x.id === moduleName).questions[challengeNumber].question}
                        </ul>
                        <Editor
                            height="40vh"
                            defaultLanguage="python"
                            value={ challengeAnswer[moduleName].question_data[challengeNumber].mycode.replaceAll("\\n",'\n') }
                            // defaultValue = {challengeAnswer[moduleName].question_data[challengeNumber].mycode}
                            options={options}
                            onMount={handleEditorDidMount}
                            onChange={handleEditorChange}
                        />
                    </div>
                </div>

            <p></p>
            
            <div className="editor-output">
                <div className="output">
                    <h3>Output</h3>
                    <ul>
                        {
                        output.at(-1)
                        }
                    </ul>
                    <CheckOutputComponent output={output} moduleName={moduleName}/>
                    <div className = "pointdescription"> You have {score} <FontAwesomeIcon icon="fa-solid fa-coins" /></div>
                    <div className = "pointdescription"> 50 <FontAwesomeIcon icon="fa-solid fa-coins" /> are need to use a hint.</div>
                </div>
                <div class="btn-group btn-group-editor-run" role="group">
                    <button type="button" className={"btn btn-primary" + (runEnabled ? "" : " disabled" )} onClick={e => runCode(e)}>Run Code</button>
                    <HintModal
                        show={modalHintShow}
                        title={challengeNumber + 1}
                        body={challengeQuestion.find(x => x.id === moduleName).questions[challengeNumber].hint}
                        onHide={() => setModalHintShow(false)}
                    />
                    <button type="button" className="btn btn-light" href="#" role="button" onClick={handleOpen}>Hint</button>
                    <ErrModal
                        show={modalErrShow}
                        title={challengeNumber + 1}
                        body={deduceErrorMessage()}
                        onHide={() => setModalErrShow(false)}
                    />
                    {/* <NextQuestionModal
                        show={modalNextQuestionShow}
                        title={challengeNumber + 1}
                        body={<button onClick={() => {setChallengeNumber(challengeNumber + 1)}}>Try Next Question</button>}
                        onHide={() => setModalNextQuestionShow(false)}
                    /> */}
                    {errorMessage != "" ? <button type="button" className="btn btn-light" href="#" role="button" onClick={() => {setModalErrShow(true)}}>Error Check</button> : ""}
                </div>
            </div>
        </div>
    )
}