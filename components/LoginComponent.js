import { useRef, useState, useContext } from 'react'
import Context from '../context/Context'
import { Student, getStudent, createStudent } from '../data/Students'
import validator from 'validator'
import { v4 as uuidv4 } from "uuid"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, sendSignInLinkToEmail, UserCredential } from "firebase/auth"
import { auth } from '../firebase'
import { v4 } from 'uuid'

// import { loginEmail, signupEmail } from './firebase.js'

/**
 * The login and signup component
 * @param {*} props 
 * @returns HTML for login/signup components
 */
function LoginComponent(props) {
    const [signUp, setSignUp] = useState(false)

    const signUpNameRef = useRef(null)
    const signUpEmailRef = useRef(null)
    const signUpPasswordRef = useRef(null)
    const signUpPasswordConfirmRef = useRef(null)

    const signInEmailRef = useRef(null)
    const signInPasswordRef = useRef(null)

    const { setUser } = useContext(Context)

    // const answer1 = useRef(null)
    const answer2 = useRef(null)
    const answer3 = useRef(null)
    const answer4 = useRef(null)

    /**
     * Validates the input contents for the sign up form
     * 
     * @param { name, email, password, passwordRepeat } formData 
     * @returns boolean
     */
    const validateSignUp = ({ name, email, password, passwordRepeat }) => {
        if (!name || !email || !password || !passwordRepeat) {
            return false
        }

        if (!validator.isEmail(email)) {
            return false
        }

        if (password !== passwordRepeat) {
            return false
        }

        if (password.length < 6) {
            return false
        }

        if (!email.endsWith('@sfu.ca')) {
            return false
        }

        return true
    }

    /**
     * Validates the input contents for the sign in form
     * @param { email, password } inputs
     * @returns True if valid, false if invalid
     */
    const validateSignIn = ({ email, password }) => {
        if (!email || !password) {
            return false
        }

        if (!validator.isEmail(email)) {
            return false
        }

        if (!email.endsWith('@sfu.ca')) {
            return false
        }

        // if (!auth().currentUser.emailVerified) {
        //     return false
        // }

        return true
    }

    const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        // url: 'https://www.example.com/finishSignUp?cartId=1234',
        url: 'http://learningpython.page.link',
        // This must be true.
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.example.ios'
        },
        android: {
          packageName: 'com.example.android',
          installApp: true,
          minimumVersion: '12'
        },
        dynamicLinkDomain: 'https://learningpython.page.link'
    }

    //Function called right after the signUpWithEmailAndPassword to send verification emails
    const sendVerificationEmail = () => {
        // console.log("here")
        //Built in firebase function responsible for sending the verification email
        sendSignInLinkToEmail(auth, email, actionCodeSettings)
        .then(() => {
            // The link was successfully sent. Inform the user.
            // Save the email locally so you don't need to ask the user for it again
            // if they open the link on the same device.
            // console.log("here2")
            window.localStorage.setItem('emailForSignIn', email);
            console.log("Verification email is sent")
            // ...
        })
        .catch((error) => {
            console.log("Error")
            const errorCode = error.code;
            const errorMessage = error.message;
            // ...
        })
    }

    /**
     * Handles the sign up form submission
     * 
     * @param {e} e 
     */
    const handleSignUp = (e) => {
        e.preventDefault()

        const name = signUpNameRef.current.value
        const email = signUpEmailRef.current.value
        const password = signUpPasswordRef.current.value
        const passwordRepeat = signUpPasswordConfirmRef.current.value
        // const expertise = expertiseLevel.current.value
        // const ans1 = answer1.current.value
        const ans2 = answer2.current.value
        const ans3 = answer3.current.value
        const ans4 = answer4.current.value
        const temp = 0
        const expertise = 0

        if (validateSignUp({ name, email, password, passwordRepeat })) {
            // console.log('here2')
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // ToDo: create anonymous name generation
                    if (ans2 == "1") {
                        temp += 1
                    }
                    if (ans3 == "5") {
                        temp += 1
                    }
                    if (ans4 == "18") {
                        temp += 1
                    }
                    if (temp == 0) {
                        expertise = 0
                    }
                    else if (temp == 3) {
                        expertise = 2
                    }
                    else {
                        expertise = 1
                    }
                    
                    const student = new Student(uuidv4(), name, email, expertise, null, false, [], 1, [], 0, [])
                    // console.log('here1')
                    // ToDo: if student already exists, do not create new student
                    createStudent(student).then((result) => {
                        if (result == false) {
                            alert('Student already exists. Please use your own email address.')
                        } else {
                            localStorage.setItem('auth', JSON.stringify(student))
                            setUser(student)
                            alert("You got " + temp + "/5 question correct.\r\n" + "Account has been created! You are now signed in.")
                            setSignUp(false)
                        }
                    })
                    // sendVerificationEmail()
                    const user = userCredential.user;
                    sendEmailVerification(user)
                    .then(() => {
                        // Email verification sent!
                        // let msg = 'An email verification link has been sent to ' + user.email;
                        // document.querySelector('.success.email_msg').innerHTML=msg;
                    });
                    // await sendEmailVerification(userCredential.user);
                    loginSuccess(student.email, student.uuid)
                })
                .catch((error) => {
                    if (error.code == "auth/email-already-in-use") {
                        alert("The email address is already in use") }
                })
                // sendEmailVerification().then(function(){
                //     console.log('email sent');
                // }).catch('email not sent');
        } else {
            alert('Please ensure that your email is @sfu.ca and that your password is at least 6 characters long.')
        }
    }
    const loginSuccess = (email, uid) => {
        const login_area = document.getElementById('login-area');
        login_area.innerHTML = `<h2>Login Success!</h2><div>uid: ${uid}</div><div>email: ${email}</div>`;
    }
      

    /**
     * Handles the sign in form submission
     * @param {Event} e 
     */
    const handleSignIn = (e) => {
        e.preventDefault()

        const email = signInEmailRef.current.value
        const password = signInPasswordRef.current.value

        if (validateSignIn({ email, password })) {
            // Do firebase login
            signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                if(!auth.currentUser.emailVerified) {
                    alert("Email is not verified")
                }
                else {getStudent(email).then((student) => {
                    localStorage.setItem('auth', JSON.stringify(student))
                    setUser(student)
                })}
            })
            .catch((error) => {
                // login error
                // ToDo: handle error message
                alert(error.message)
            })
        } else {
            alert('Please ensure that your email is @sfu.ca.')
        }
    }

    /**
     * Sends an email to the user with a link to reset their password
     * @param {Event} e 
     */
    const handleForgotPassword = (e) => {
        e.preventDefault()

        sendPasswordResetEmail(auth, signInEmailRef.current.value).then(() => {
            alert("Password reset email sent. Please check your email.")
        })
    }
    // const emailVerification = (e) => {
    //     e.preventDefault()

    //     const email = signInEmailRef.current.value

    //     sendSignInLinkToEmail(auth, email, actionCodeSettings)
    //     .then(() => {
    //         // The link was successfully sent. Inform the user.
    //         // Save the email locally so you don't need to ask the user for it again
    //         // if they open the link on the same device.
    //         window.localStorage.setItem('emailForSignIn', email);
    //         // ...
    //     })
    //     .catch((error) => {
    //         const errorCode = error.code;
    //         const errorMessage = error.message;
    //         // ...
    //     })
    // }

    /**
     * Sends an email to the user with a link to reset their password
     * @param {Event} e 
     */
     const question_shown = (e) => {
        // e.preventDefault()
        console.log("here")
        if(document.getElementById("demo").style.visibility == "hidden") {
            console.log("here")
            document.getElementById("demo").style.visibility = "visible"
            document.getElementById("submit_button").style.visibility = "visible"
            document.getElementById("submit_button2").style.visibility = "invisible"
        }
        else{
            console.log("here2")
            document.getElementById("demo").style.visibility = "hidden"
            document.getElementById("submit_button").style.visibility = "hidden"
            document.getElementById("submit_button2").style.visibility = "visible"
        }
    }

    if (signUp) {
        return (
        <div className = "signup_box">
            <div className="signup text-center">
                <form className="form-signin">
                    <br></br>
                    <h1 className="text-2xl xl:text-3xl font-extrabold">Sign Up</h1>
                    <p className="mb-3 text-muted">
                        Already have an account? <a href="#" onClick={() => setSignUp(false)}>Sign in</a>.
                    </p>
                    <input type="text" id="inputName" className="form-control input-sm mb-2" placeholder="Name" required="True" ref={signUpNameRef} />
                    <input type="email" id="inputEmail" className="form-control input-sm mb-2" placeholder="Email address" required="True" ref={signUpEmailRef} />
                    <input type="password" id="inputPassword" className="form-control input-sm mb-2" placeholder="Password" required="True" ref={signUpPasswordRef} />
                    <input type="password" id="inputPasswordRepeated" className="form-control input-sm mb-2" placeholder="Repeat password" required="True" ref={signUpPasswordConfirmRef} />
                </form>
                <form className="level_switch">
                    <span className = "level_selection">Do you have experience in Programming?</span>
                    <p className="level_switch_muted">
                        If you choose "having experience", we will give some questions to check your expertise.
                        <br></br>
                        If you don't have, please feel free to choose "No".
                    </p>
                    <label class="switch">
                        <input type="checkbox"/>
                        <span class="slider" onClick = {question_shown}></span>
                    </label>
                    {/* <br></br> */}
                    {/* <span class = "level_selection">Do you have experience in Programming?</span> */}
                    {/* <button className="button_level" type="submit" onClick={handleSignUp}>Yes</button> */}
                    {/* <button className="button_level2" type="submit" onClick={handleSignUp}>No</button> */}
                    <br></br>
                    <br></br>
                    {/* <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={handleSignUp}>Sign up</button> */}
                    <button class="cta" id = "submit_button" type="submit" onClick={handleSignUp}>
                        <span>Sign up</span>
                        <svg viewBox="0 0 13 10" height="10px" width="15px">
                            <path d="M1,5 L11,5"></path>
                            <polyline points="8 1 12 5 8 9"></polyline>
                        </svg>
                    </button>
                    {/* this is the tooltip part, the point is using span thing. I changed the given code, so you can change is back to the given code. */}
                    {/* <p>
                        What is your expertise level in<br></br>
                        <span class="tooltip">
                            conditional statements?<span class="tooltip-text">Example</span>
                        </span>
                    </p> */}
                    {/* <input type="range" className="form-range" id="expertiseRange" min = "1" max = "5" step="1" defaultValue = "3" required = "True" list = "tickmarks" ref={expertiseLevel}/> */}
                    {/* <pre className="range-label">(Novice)1        2        3        4         5(Expert)</pre> */}
                    {/* <pre className="Question">What is the output of the following code?</pre> */}
                    <br></br>
                </form>
                <div>
                <form className = "signup_question_box">
                <form className = "white_box" id = "demo"></form>
                <form className = "title-question">
                    <br></br>
                    <span class="title-question">Let's check your expertise level in python.</span>
                    {/* <br></br> */}
                    {/* <div class="question" id = "question-1">
                    <div class ="question-content">
                        <p>
                            <span class = "question_num">1. </span>
                            "What is the output of the following code?"
                        </p>
                        <div class = "code-toolbox">
                            <pre id="syntax" class = "language">
                                <code class="language-python">
                                    salary 
                                    <span class = "token operator">=</span>
                                    <span class = "token number">10000</span>
                                    <br></br>
                                    <span class = "token keyword">print</span>
                                    <span class = "token punctuation">(</span>
                                    <span class="token string">"Salary:"</span>
                                    <span class="token punctuation">, </span>
                                    salary
                                    <span class="token punctuation">)</span>
                                </code>
                            </pre>
                        </div>
                        <input type="answer1" id="inputAnswer1" className="answer-box" placeholder="Answer" required="True" ref={answer1} />
                    </div>
                    </div> */}
                    <div class="question" id = "question-2">
                    <div class ="question-content">
                        <p>
                            <span class = "question_num">1. </span>
                            "What is the output of the following code?"
                        </p>
                        <div class = "code-toolbox">
                            <pre id="syntax" class = "language">
                                <code class="language-python">
                                    myNumber 
                                    <span class = "token operator"> = </span>
                                    <span class = "token number">1</span>
                                    <br></br>
                                    <span class = "token keyword">if </span>
                                     myNumber 
                                    <span class = "token operator"> % </span>
                                     2 
                                    <span class = "token operator"> == </span>
                                    0
                                    <span class = "token punctuation">:</span>
                                    <br></br>
                                    <span class="token keyword">    print</span>
                                    <span class="token punctuation">(</span>
                                    "correct"
                                    <span class = "token punctuation">)</span>
                                    <br></br>
                                    <span class = "token keyword">else</span>
                                    <span class = "token punctuation">:</span>
                                    <br></br>
                                    <span class="token keyword">    print</span>
                                    <span class="token punctuation">(</span>
                                    myNumber
                                    <span class = "token punctuation">)</span>
                                </code>
                            </pre>
                        </div>
                        <input type="answer1" id="inputAnswer1" className="answer-box" placeholder="Answer" required="True" ref={answer2} />
                    </div>
                    </div>
                    <div class="question" id = "question-3">
                    <div class ="question-content">
                        <p>
                            <span class = "question_num">2. </span>
                            "What is the output of the following code?"
                        </p>
                        <div class = "code-toolbox">
                            <pre id="syntax" class = "language">
                                <code class="language-python">
                                    <span class="token keyword">def </span>
                                    <span class="token function">calculate</span>
                                    <span class="token punctuation">(</span>
                                    num1
                                    <span class="token punctuation">, </span>
                                    num2
                                    <span class = "token operator"> = </span>
                                    <span class="token number">1</span>
                                    <span class="token punctuation">):</span>
                                    <br></br>
                                    <span class="to">    numList</span>
                                    <span class = "token operator"> = </span>
                                    ""
                                    <br></br>
                                    <span class="token keyword">    for </span>
                                    i
                                    <span class="token keyword"> in range</span>
                                    <span class="token punctuation">(</span>
                                    0, num1, num2
                                    <span class="token punctuation">):</span>
                                    <br></br>
                                    <span class="to">        numList += str(i)</span>
                                    <br></br>
                                    <span class="token keyword">    return</span>
                                    <span class="token function"> len</span>
                                    <span class="token punctuation">(</span>
                                    numList
                                    <span class="token punctuation">)</span>
                                    {/* <span class="tn">    res</span>
                                    <span class = "token operator"> = </span>
                                    num1
                                    <span class = "token operator"> * </span>
                                    num2 */}
                                    <br></br>
                                    <br></br>
                                    result
                                    <span class = "token operator"> = </span>
                                    <span class="token function">calculate</span>
                                    <span class="token punctuation">(</span>
                                    10
                                    <span class="token punctuation">,</span>
                                    2
                                    {/* 0, 0.5, 1.0, 1.5, 2.0, 2.5 */}
                                    <span class="token punctuation">)</span>
                                    <br></br>
                                    <span class="token keyword">print</span>
                                    <span class="token punctuation">(</span>
                                    result
                                    <span class = "token punctuation">)</span>
                                </code>
                            </pre>
                        </div>
                        <input type="answer1" id="inputAnswer1" className="answer-box" placeholder="Answer" required="True" ref={answer3} />
                    </div>
                    </div>
                    <div class="question" id = "question-3">
                    <div class ="question-content">
                        <p>
                            <span class = "question_num">3. </span>
                            "What is the output of the following code?"
                        </p>
                        <div class = "code-toolbox">
                            <pre id="syntax" class = "language">
                                <code class="language-python">
                                    <span class="token keyword">def </span>
                                    <span class="token function">calculate</span>
                                    <span class="token punctuation">(</span>
                                    num1
                                    <span class="token punctuation">, </span>
                                    num2
                                    <span class = "token operator"> = </span>
                                    <span class="token number">1</span>
                                    <span class="token punctuation">):</span>
                                    <br></br>
                                    <span class="to">     numList</span>
                                    <span class = "token operator"> = </span>
                                    []
                                    <br></br>
                                    <span class="to">     result</span>
                                    <span class = "token operator"> = </span>
                                    0
                                    <br></br>
                                    <span class="token keyword">    for </span>
                                    i
                                    <span class="token keyword"> in range</span>
                                    <span class="token punctuation">(</span>
                                    0, num1, num2
                                    <span class="token punctuation">):</span>
                                    <br></br>
                                    <span class="to">        numList.append(i)</span>
                                    <br></br>
                                    <span class="token keyword">    for </span>
                                    num
                                    <span class="token keyword"> in </span>
                                    numList
                                    <span class="token punctuation">:</span>
                                    <br></br>
                                    <span class="to">        result</span>
                                    <span class = "token operator"> += </span>
                                    <span class="to">num</span>
                                    <br></br>
                                    <span class="token keyword">    return </span>
                                    result
                                    {/* <span class="tn">    res</span>
                                    <span class = "token operator"> = </span>
                                    num1
                                    <span class = "token operator"> * </span>
                                    num2 */}
                                    <br></br>
                                    <br></br>
                                    result
                                    <span class = "token operator"> = </span>
                                    <span class="token function">calculate</span>
                                    <span class="token punctuation">(</span>
                                    10
                                    <span class="token punctuation">,</span>
                                    3
                                    {/* 0, 0.5, 1.0, 1.5, 2.0, 2.5 */}
                                    <span class="token punctuation">)</span>
                                    <br></br>
                                    <span class="token keyword">print</span>
                                    <span class="token punctuation">(</span>
                                    result
                                    <span class = "token punctuation">)</span>
                                </code>
                            </pre>
                        </div>
                        <input type="answer1" id="inputAnswer1" className="answer-box" placeholder="Answer" required="True" ref={answer4} />
                    </div>
                    </div>
                    <button class="cta2" id = "submit_button2" type="submit" onClick={handleSignUp}>
                        <span>Sign up</span>
                        <svg viewBox="0 0 13 10" height="10px" width="15px">
                            <path d="M1,5 L11,5"></path>
                            <polyline points="8 1 12 5 8 9"></polyline>
                        </svg>
                    </button>
                    {/* <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={handleSignUp}>Sign up</button> */}
                </form>
                </form>
            </div>
            </div>
        </div>
        )
    } else {
        return (
            <div className="signin text-center">
                <form className="form-signin">
                    <h1 className="h3 font-weight-normal">Please Sign In</h1>
                    <p className="mb-3 text-muted">
                        Don't have an account? <a href="#" onClick={() => setSignUp(true)}>Sign up</a>.
                    </p>
                    <p className="mb-3 text-muted">
                        Forgot password? Type your email below and click <a href="#" onClick={handleForgotPassword}>here</a>.
                    </p>
                    <input type="email" id="inputEmail" className="form-control input-sm mb-2" placeholder="Email address" required="True" ref={signInEmailRef} />
                    <input type="password" id="inputPassword" className="form-control input-sm mb-2" placeholder="Password" required="True" ref={signInPasswordRef} />
                    <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={handleSignIn}>Sign in</button>
                </form>
            </div>
        )
    }
}

export default LoginComponent