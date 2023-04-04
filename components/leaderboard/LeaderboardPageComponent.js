import React, { useEffect, useState } from 'react'
import { getLeaderboardData } from "../../data/LeaderboardData"
import List from "./List";

export default function LeaderboardPageComponent() {

    const [ data, setData ] = useState([])
    //     [{
    //         name : "default1",
    //         score : 4444
    //     }, {
    //         name : "default2",
    //         score : 1234
    //     }]
    // )

    useEffect(() => {
        console.log("Leaderboard Page Mounted!\nReading Firebase Data!");
        const theData = getLeaderboardData()
        theData.then(value => {
            setData(value)
        })
    }, [])

    const labels = [{
        rank : "Rank",
        name : "Name", 
        score : "Score",
        mcqsolved : "MCQ's Solved",
        challsolved : "Challenge Questions Solved",
        badges : "Badges"
    }]

    return (
        <div>
            <div className='header-block'>
                <h2>Leaderboard</h2>
            </div>
            <div className="leaderboard-block">
                <div className="flex-grow-1">
                    <div className="row mb-3">
                        <List data={labels} isHeader={true}/>
                        <List data={data} isHeader={false}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
