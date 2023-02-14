import { useContext, useState, useEffect } from 'react'
import Context from '../context/Context'
import { giveStudentScore, getStudentScore, takeStudentScore } from '../data/Students'
import UserLinkComponent from './UserLinkComponent'
import AchievementComponent from '../components/AchievementComponent'
import achievementsJson from '../data/achievements.json'
import { getFriends } from '../data/Students.js'
import { Friendship } from '../context/Friendship.js'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
// import Box from '@mui/material/Box';

import axios from 'axios'
import styles from '../styles/Button.module.css'

import Editor from "@monaco-editor/react"
// import CircularProgress from '@material-ui/core/CircularProgress';

import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Badges from "./Badges";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins} from "@fortawesome/free-solid-svg-icons";


/**
 * Component for the user's own profile.
 * ToDo: Combine this with StudentProfileComponent.
 * See StudentProfileComponent for details.
 * @param {*} props 
 * @returns HTML for user's own profile
 */
export default function ProfileComponent(props) {
    const { user } = useContext(Context)
    const [achievements, setAchievements] = useState([])
    const [friends, setFriends] = useState(null)

    const currentScore = getStudentScore(user)
    const leftPoint = currentScore - leftPoint

    // const loadAchievements = () => {
    //     const studentAchievements = user.achievements
    //     const achievements = achievementsJson.achievements.filter(a => studentAchievements.includes(a.id))

    //     setAchievements(achievements.map(achievement => {
    //         return (<AchievementComponent id={achievement.id} description={achievement.description} emoji={achievement.emoji} />)
    //     }))
    // }

    const getFriendsList = () => {
        setFriends([])
        getFriends(user, Friendship.ACCEPTED).then(f => {
            if (f.length === 0) {
                setFriends([(<li>No friends yet.</li>)])
                return
            }

            setFriends(f.map((friend, index) => {
                return (<li key={index}><UserLinkComponent uuid={friend.uuid} name={friend.name} /></li>)
            })
        )})
    }

    const getFriendsElement = () => {
        if (friends === null) {
            return (<Skeleton count={3}></Skeleton>)
        } else {
            return (
                <ul>
                    {friends}
                </ul>
            )
        }
    }

    const containerStyles = {
        height: 20,
        width: '100%',
        backgroundColor: "#e0e0de",
        borderRadius: 50,
        margin: 50
      }
    
      const fillerStyles = {
        height: '100%',
        width: `67%`,
        backgroundColor: 'red',
        borderRadius: 'inherit',
        textAlign: 'right'
      }
    
      const labelStyles = {
        padding: 5,
        color: 'white',
        fontWeight: 'bold'
      }

    useEffect(() => {
        // loadAchievements()
        getFriendsList()
    }, [])

    function show_point() {
        currentScore.then((value) => {
            document.getElementById('p').innerHTML = 'Current point : ' + value +'</p>';
        });
    }

    return (
        <div className="container mx-auto">
            <h3>My Profile</h3>
            <hr />
            <div class="grid lg:grid-col-3" >
                <div className="row ">
                    
                  <div className="col-md-auto ">
                    <h4>Modules</h4>
                    <div className = {styles.box}>
                        <h2>Introduction to Python Programming
                            <br></br>
                            <br></br>  
                        </h2>
                        <ul>
                            {/* <li>Conditonal Statement &emsp; <CircularProgress  variant="static" value={70} size={20} /> </li> */}
                            <li>Topic Two</li>
                            <li>Topic Three</li>
                            <li>Topic Four</li>
                            <li>Topic Five</li>
                            <li>Topic Six</li>
                        </ul>
                    </div>
                  </div>

                  <div className="col-sm ">
                    <div className="row ">
                        <h4>Achievements</h4>
                        {/* <ul className="achievement-list">
                            {
                                achievements.length === 0 ? <p>No achievements yet.</p> : achievements.map(achievement => {
                                    return (
                                        <li>
                                            {achievement}
                                        </li>
                                    )
                                })
                            }
                        </ul> */}
                        <div class="" >
                            <Router>
                                <Routes>
                                <Route path="/" element={<Badges/>}/>
                                </Routes>
                            </Router> 
                        </div> 
                        </div>
                        <div className="row balance">
                            <div onload = {show_point()}></div>
                            <FontAwesomeIcon icon={faCoins} size="3x" />
                            {/* <span > Earned: 1300 pts <br/>[ 1700 points left ]</span> */}
                            <span id = "p"> </span>
                        </div>

                        
                  </div>
                  {/* <div className="row">
                  </div> */}
                </div>
            </div>
        </div>
    )
}