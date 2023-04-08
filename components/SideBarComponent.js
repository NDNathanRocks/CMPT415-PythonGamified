import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import SideNav, {
    Toggle,
    NavItem, 
    NavIcon, 
    NavText,
}from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import { useContext } from 'react'
import Context from '../context/Context'

export default function SideBar(props) {
    library.add(fab, fas, far)

    const { challengeAnswer, setChallengeNumber, challengeNumber, challengeQuestion, setEditorState } = useContext(Context)
    const moduleName = props.moduleName


    const questionTopicsList = challengeQuestion.find(x => x.id === moduleName).questions.sort((a, b) => b.difficulty.localeCompare(a.difficulty)).map((question, i) => (
        <NavItem eventKey={question.id}>
            <NavText>
                <div className='mysidenav-item'>
                    <span>{question.title}</span>
                    <span>{question.difficulty}</span>
                    { challengeAnswer[moduleName].question_data.find(x => x.id === question.id).completed ? <span>✅</span> : <span>❌</span>}
                </div>
            </NavText>
        </NavItem> 
    ))
    
    return ( 
    
        <SideNav 
            onSelect={selected=> { 
                if (selected == "quiz") {
                    props.sideOut("quiz")
                    setEditorState(0)
                } else {
                    props.sideOut("else")
                    setChallengeNumber(parseInt(selected))
                }
            }}
            className="mysidenav"
        >
            <SideNav.Toggle />
            <SideNav.Nav defaultSelected = "home">
                <NavItem eventKey="quiz">
                    <NavIcon><FontAwesomeIcon icon="fa-regular fa-pen-to-square"/></NavIcon>
                    <NavText>Quiz</NavText>
                </NavItem>
                <NavItem eventKey="comp">
                    <NavIcon><FontAwesomeIcon icon="fa-solid fa-brain" /></NavIcon>
                    <NavText>Challenge</NavText>
                    {challengeQuestion.find(x => x.id === moduleName) && questionTopicsList}
                    {/* {challengeQuestion[moduleName] ? questionTopicsList: null} */}
                </NavItem>
            </SideNav.Nav>

        </SideNav>
    )
}