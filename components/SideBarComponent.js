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

    const { challengeNumber, setChallengeNumber, challengeQuestion } = useContext(Context)


    return ( 
    
        <SideNav 
            onSelect={selected=> { 
                if (selected == "quiz") {
                    props.sideOut("quiz")
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
                    <NavItem eventKey="0">
                        <NavText>{challengeQuestion[0].title}</NavText>
                    </NavItem>
                    <NavItem eventKey="1">
                        <NavText>{challengeQuestion[1].title}</NavText>
                    </NavItem>
                    <NavItem eventKey="2">
                        <NavText>{challengeQuestion[2].title}</NavText>
                    </NavItem>
                    <NavItem eventKey="3">
                        <NavText>{challengeQuestion[3].title}</NavText>
                    </NavItem>
                </NavItem>
            </SideNav.Nav>

        </SideNav>

        /* // <div class="bg-primary text-dark bg-opacity-25 rounded ps-2 pt-4 me-5 mb-4">
        //     <div>
        //         <div class="d-flex flex-row justify-content-between rounded sidebar_row px-4 py-2">
        //             <div class="d-flex flex-row justify-content-between">
        //                 <h5>Material</h5>
        //                 <h5 class="ms-2"><FontAwesomeIcon icon="fa-solid fa-book-open" /></h5>
        //             </div>
        //             <h5 class="ms-5"><FontAwesomeIcon icon="fa-solid fa-chevron-right"/></h5>
        //         </div>
        //         <div class="d-flex flex-row justify-content-between rounded sidebar_row px-4 py-2">
        //             <div class="d-flex flex-row justify-content-between">
        //                 <h5>Quiz</h5>
        //                 <h5 class="ms-2"><FontAwesomeIcon icon="fa-regular fa-pen-to-square" /></h5>
        //             </div>
        //             <h5 class="ms-5"><FontAwesomeIcon icon="fa-solid fa-chevron-right"/></h5>
        //         </div>
        //         <div class="d-flex flex-row justify-content-between rounded sidebar_row px-4 py-2">
        //             <div class="d-flex flex-row justify-content-between">
        //                 <h5>Challenge</h5>
        //                 <h5 class="ms-2"><FontAwesomeIcon icon="fa-solid fa-brain" /></h5>
        //             </div>
        //             <h5 class="ms-5"><FontAwesomeIcon icon="fa-solid fa-chevron-right"/></h5>
        //         </div>
        //     </div>
        // </div> */
    )
}