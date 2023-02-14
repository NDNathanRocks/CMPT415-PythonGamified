import styled from "styled-components";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faCertificate, faAward, faMedal, faStar } from "@fortawesome/free-solid-svg-icons";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';


const Badges = (props)=> {

    return (
        <div>
            {/* <h1><center>Badges</center>
            </h1> */}
            <br/>
            <Grid>
                <Row>
                    <Col size={1}>
                        <Tippy content="Attempting a question every day for a week"><div>
                        <center><FontAwesomeIcon icon={faMedal} size="3x" /></center>
                        <center><h5 >Active Badge</h5></center>
                        </div></Tippy>
          
                    </Col>
                    <Col size={1}>
                        <Tippy content="Getting 5 consecutive question correct on the first try"><div>
                        <center><FontAwesomeIcon icon={faStar} size="3x"/></center>
                        <center><h5 >Streak Badge</h5></center>
                        </div></Tippy>
                    </Col>
                    <Col size={1}>
                        <Tippy content="Reaching the Max Level (10000 pts)"><div>
                        <center><FontAwesomeIcon icon={faTrophy} size="3x"/></center>
                        <center><h5>Master Badge</h5></center>
                        </div></Tippy>
                    </Col>
                    <Col size={1}>
                        <Tippy content="Reattempting 5 questions correctly after interactive feedback"><div>
                        <center><FontAwesomeIcon icon={faCertificate} size="3x"/></center>
                        <center><h5>Learner Badge</h5></center>
                        </div></Tippy>
                        
                    </Col>
                    <Col size={1}>
                        <Tippy content="Mastering a concept can get a badge (Conditional statement badge, Loop badge)"><div>
                        <center><FontAwesomeIcon icon={faAward} size="3x"/></center>
                        <center><h5>Concept Badge</h5></center>
                        </div></Tippy>
                        
                    </Col>
                </Row>
            </Grid>
            {/* <ToastContainer /> */}
        </div>
    )
}

export default Badges;

export const Grid = styled.div`
`;

export const Row = styled.div`
    display: flex;
`;

export const Col = styled.div`
    flex: ${(props) => props.size};
`;