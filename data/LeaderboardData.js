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
 * Get Data from Student
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

/**
 * Updates Scores
 */
export async function updateScore(student, score) {
    const ref = collection(db, "students")
    const q = query(ref, where("email", "==", student.email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }
    const studentDoc = querySnapshot.docs[0]
    const studentData = studentDoc.data()
    const currentScore = studentData.score

    await updateDoc(studentDoc.ref, { score: currentScore + score })
    return true
};

/**
 * Run when student solves a question
 */
export async function solvedQuestionUpdate(student, title, questionNumber) {
  const ref = collection(db, "students")
  const q = query(ref, where("email", "==", student.email))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
      return false
  }

  const studentDoc = querySnapshot.docs[0]
  const studentData = studentDoc.data()
  const currentQuestion = studentData.challenge_questions
  
  if (!currentQuestion.modules[title].solved_questions.includes(questionNumber)) {
    currentQuestion.modules[title].solved_questions.push(questionNumber)
  }

  // Update firebase with changes
  await updateDoc(studentDoc.ref, { challenge_questions: currentQuestion })
  return true
};

/**
 * Run when student runs their code
 */
export async function updateQuestionData(student, title, theData) {
  const ref = collection(db, "students")
  const q = query(ref, where("email", "==", student.email))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
      return false
  }

  const studentDoc = querySnapshot.docs[0]
  const studentData = studentDoc.data()
  const currentQuestion = studentData.challenge_questions
  
  currentQuestion.modules[title].question_data = theData

  // Update firebase with changes
  await updateDoc(studentDoc.ref, { challenge_questions: currentQuestion })
  return true
};


/**
 * Run when student solves a question
 * Returns true if hint is used... else returns false and updates the hint used
 */
export async function checkHintUsedAndUpdate(student, title, questionNumber) {
  const ref = collection(db, "students")
  const q = query(ref, where("email", "==", student.email))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
      return false
  }

  const studentDoc = querySnapshot.docs[0]
  const studentData = studentDoc.data()
  const currentQuestion = studentData.challenge_questions
  
  if (!currentQuestion.modules[title].used_hints.includes(questionNumber)) {
    currentQuestion.modules[title].used_hints.push(questionNumber)
    updateScore(student, -50)
  } else {
    return true
  }

  // Update firebase with changes
  await updateDoc(studentDoc.ref, { challenge_questions: currentQuestion })
  return false
};
