import React from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, getDoc, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

export function ChallengeQuestions() {
  console.log("inside cq data handler");
  return (
    <div>ChallengeQuestions</div>
  )
}

/**
 * Returns output for setChallengeQuestion()
 */
export async function getQuestionsList() {
    const ref = collection(db, "quiz-questions/conditional-statements/challenge")
    const data = await getDocs(ref);
    const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
    return(filteredData);
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
