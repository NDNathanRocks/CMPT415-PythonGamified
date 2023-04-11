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
export async function getQuestion() {
    const ref = collection(db, "challenge_questions/")
    const data = await getDocs(ref);
    const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
    return(filteredData);
};

/**
 * Get Data from Student
 */
export async function getAnswer(student) {
  const ref = collection(db, "students")
  const q = query(ref, where("email", "==", student.email))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
      return []
  }

  const studentDoc = querySnapshot.docs[0]
  const studentData = studentDoc.data()
  const currentQuestion = studentData.challenge_questions.modules

  return currentQuestion
};

/**
 * Get Score
 */
export async function getScore(student) {
  const ref = collection(db, "students")
  const q = query(ref, where("email", "==", student.email))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
      return false
  }
  const studentDoc = querySnapshot.docs[0]
  const studentData = studentDoc.data()
  const currentScore = studentData.score

  return currentScore
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
  console.log("Updated Question Data to Firebase");
  return true
};

// /**
//  * Run when student runs their code
//  */
// export async function updateQuestionData(student, title, theData) {
//   const ref = collection(db, "quiz_questions")
//   const querySnapshot = await getDocs(ref)

//   if (querySnapshot.empty) {
//       return false
//   }

//   const studentDoc = querySnapshot.docs[0]
//   const studentData = studentDoc.data()
//   const currentQuestion = studentData.conditional_statements
  
//   currentQuestion.challenge = theData

//   console.log(theData);

//   // Update firebase with changes
//   await updateDoc(studentDoc.ref, { challenge_questions: currentQuestion })
//   return true
// };

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


/**
 * Run when student solves a question
 * Returns true if completed and added points... else returns false
 */
export async function checkAllCompleted(student, title) {
  const ref = collection(db, "students")
  const q = query(ref, where("email", "==", student.email))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
      return false
  }

  const studentDoc = querySnapshot.docs[0]
  const studentData = studentDoc.data()
  const currentQuestion = studentData.challenge_questions

  // Check if questions are all completed
  for (let i = 0 ; i < currentQuestion.modules[title].question_data.length ; i++) {
    // If something isn't completed return false
    if (currentQuestion.modules[title].question_data[i].completed == false) {return false}
  }
  
  // Check if already received
  if (!currentQuestion.modules[title].bonusReceived) {
    currentQuestion.modules[title].bonusReceived = true
    updateScore(student, 67)
    // Update firebase with changes
    await updateDoc(studentDoc.ref, { challenge_questions: currentQuestion })
    return true
  }

  return false
};
