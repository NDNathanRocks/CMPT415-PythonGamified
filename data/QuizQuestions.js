import { db } from '../firebase'
import { collection, query, where, getDocs, getDoc, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Represents a quiz question in the system
 * 
 * @typedef {Object} QuizQuestion
 */
export class QuizQuestion {
    constructor(topic, qid, question, code, answerOptions, answerIndex, explanation) {
        this.topic = topic
        this.qid = qid
        this.question = question
        this.code = code
        this.answerOptions = answerOptions
        this.answerIndex = answerIndex
        this.explanation = explanation
    }
}

/**
 * Converts between the QuizQuestion class schema and
 * the firebase schema
 */
const quizQuestionConverter = {
    toFirestore: function (quizQuestion) {
        return {
            topic: quizQuestion.topic,
            qid: quizQuestion.qid,
            question:  quizQuestion.question,
            code:  quizQuestion.code,
            answer_options: quizQuestion.answerOptions,
            answer_index:  quizQuestion.answerIndex,
            explanation: quizQuestion.explanation

        }
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options)
        console.log(data.topic)
        console.log(data.question)
        return new QuizQuestion(data.topic, data.qid, data.question, data.code, data.answer_options, data.answer_index, data.explanation)
    }
}

/**
 * Returns a QuizQuestion by qid
 * @param {string} qid 
 * @returns Student
 */
export async function getQuizQuestionById(qid) {
    const q = query(collection(db, "quiz-questions/conditional-statements/multiple-choice"), where("qid", "==", qid))

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
        return null
    }

    return quizQuestionConverter.fromFirestore(querySnapshot.docs[0], { idField: "qid" })
}