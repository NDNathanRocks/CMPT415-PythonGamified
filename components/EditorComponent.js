import Editor from "@monaco-editor/react"
import { useRef, useState, useContext, useEffect } from 'react'
import Context from '../context/Context'
import axios from 'axios'
import CheckOutputComponent from "./CheckOutputComponent"
import Modal from "./Modal"
import ChallengeQuestionComponent from "./ChallengeQuestionComponent"
import { get } from "https"

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
    
    const { challengeNumber, challengeQuestion } = useContext(Context)

    // State for the code's output
    const [output, setOutput] = useState(["# Your output will be displayed here\n"])

    // State for if the code can be ran right now
    const [runEnabled, setRunEnabled] = useState(true)

    // State for the prompt
    const [prompt, setPrompt] = useState()

    // For RunCode Error Message
    const [errorMessage, setErrorMessage] = useState("")
    const [openErrorMessage, setOpenErrorMessage] = useState(false)

    // Context used: editor state
    const { setEditorState } = useContext(Context)

    // Ref for the editor element
    const editorRef = useRef()

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor
    }

    /**
     * Converts the prompt into a list of tasks
     * @param {*} questionPrompt 
     */
    // const convertPromptIntoList = (questionPrompt) => {
    //     // break questionPrompt into lines
    //     const lines = questionPrompt.split('\n')
    //     const newList = []

    //     // for each line, create a list item
    //     lines.forEach((line) => {
    //         newList.push(<li>{line}</li>)
    //     })

    //     setPrompt(newList)
    // }

    /**
     * Closes the editor.
     */
    // const closeCodingChallenge = () => {
    //     setEditorState(0)
    // }

    useEffect(() => {
        // setPrompt(challengeData)
        console.log("Editor Mounted")
    }, [])

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
                    console.log("Error:" + message);
                    setErrorMessage(message)
                    setOpenErrorMessage(true)
                } else {
                    setErrorMessage("")
                    setOpenErrorMessage(false)
                }

                const out = response2.data.stdout
                const b = Buffer.from(out, 'base64')
                const s = b.toString('ascii')
                setOutput([...output, s])
                setRunEnabled(true)
              }).catch(function (error) {
                // alert("Error: " + error)
                setRunEnabled(true)
              })

          }).catch(function (error) {
              alert("Error: " + error)
              setRunEnabled(true)
          })
    }

    useEffect(() => {
        setOutput([challengeQuestion[challengeNumber].output])
    }, [challengeNumber])

    /**
    * Modal Stuff
    **/
    const [open, setOpen] = useState(false);
    function handleClose(){
        setOpen(false);
        setOpenErrorMessage(false);
    }
    function handleOpen(){
        setOpen(true);
    }
    useEffect(() => {
        console.log("changed open");
    }, [open])

    const deduceErrorMessage = () => {
        if (errorMessage == "") {return null}
        
        let text = errorMessage.split(" ");
        let headerText = "Unknown Error";
        let bodyText = "Im sorry, we were not able to figure out the error but you can always search it up on stack overflow! Below you will find the line giving more information about the error."
        // if (text.indexOf("SyntaxError:")) {
        //     headerText = SyntaxError
        // } else if (text.indexOf("SyntaxError:"))
        
        for (let i = 0 ; i < text.length ; i++) {
            if (text[i] == "SyntaxError:") {
                headerText = "Syntax Error!"
                bodyText = "A Syntax Error is a way of Python telling you you've got the grammar error. You might've missed something important for Python to understand the code you have written."
            } else if(text[i] == "NameError:") {
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

    return (
        <div class="codingchall">
            <h2>Coding Challenge</h2>
            <ul>
                {challengeQuestion[challengeNumber].question}
            </ul>
            <Editor
                height="40vh"
                defaultLanguage="python"
                defaultValue="# Write your code here"
                options={options}
                onMount={handleEditorDidMount}
            />
            <div className="editor-output">
                <div className="output">
                    <h3>Output</h3>
                    <ul>
                        {
                        output.at(-1)
                        }
                    </ul>
                    <CheckOutputComponent output={output}/>
                </div>
                <div class="btn-group btn-group-editor-run" role="group">
                    <button type="button" className={"btn btn-primary" + (runEnabled ? "" : " disabled" )} onClick={e => runCode(e)}>Run Code</button>
                    <button type="button" className="btn btn-light" href="#" role="button" onClick={handleOpen}>Hint</button>
                    <Modal open = {open} close = {handleClose}>
                        <h2>Hint!</h2>
                        <p></p>
                        <p>{challengeQuestion[challengeNumber].hint}</p>
                        <p>You have 190 more coins remaining... Keep coding to get more!</p>
                        <p>Happy Coding!</p>
                    </Modal>
                    <Modal open = {openErrorMessage} close = {handleClose}>
                        <h2>Error Check!</h2>
                        <p></p>
                        {deduceErrorMessage()}
                    </Modal>
                    {errorMessage != "" ? <button type="button" className="btn btn-light" href="#" role="button" onClick={() => {setOpenErrorMessage(true)}}>Error Check</button> : ""}
                    {/* <button type="button" className="btn btn-light" href="#" role="button" onClick={closeCodingChallenge}>Close Coding Challenge</button> */}
                </div>
            </div>
        </div>
    )
}