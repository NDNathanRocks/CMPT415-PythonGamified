import React, { useEffect, useState } from 'react'
import { getLeaderboardData } from "../../data/LeaderboardData"
import List from "./List";

export default function LeaderboardPageComponent() {

    const [ data, setData ] = useState(
        [{
            name : "default1",
            score : 44
        }, {
            name : "default2",
            score : 1234
        }]
    )

    useEffect(() => {
        console.log("Leaderboard Page Mounted!\nReading Firebase Data!");
        setData(data.sort((a,b) => b.score - a.score))
        // const theData = getLeaderboardData()
        // theData.then(value => {
        //     setData(value)
        // })
    }, [])

    console.log(data);
    const labels = [{
        rank : "Rank",
        name : "Name", 
        score : "Score",
        mcqsolved : "MCQ's Solved",
        challsolved : "Challenge Questions Solved"
    }]

    return (
        <div class="d-flex flex-row justify-content-between">
            <div className="flex-grow-1">
                <div className="row mb-3">
                    <div className="col d-flex justify-content-center">
                        <h2>Leaderboard</h2>
                    </div>
                    <List data={labels}/>
                    <List data={data} />
                </div>
            </div>
        </div>
    )
}
