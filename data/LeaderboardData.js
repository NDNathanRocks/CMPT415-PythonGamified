import React from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, getDoc, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { get, ref, child } from 'firebase/database'

export function LeaderboardData() {
  console.log("inside LeaderboardData handler");
  return (
    <div>LeaderboardData</div>
  )
}

/**
 * Get Data for all Students
 */
export async function getLeaderboardData() {
    const ref = collection(db, "students")
    const docSnap = await getDocs(ref)

    if (docSnap.empty) {
        return false
    }

    let theData = []

    const studentDocs = docSnap.docs

    for (let i = 0 ; i < studentDocs.length ; i++ ) {
        theData[i] = studentDocs[i].data()
    }

    theData.sort((a,b) => b.score - a.score)

    return theData
};