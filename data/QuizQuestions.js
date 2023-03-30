import { db } from '../firebase'
import { collection, query, where, getDocs, getDoc, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Represents a quiz question in the system
 * 
 * @typedef {Object} QuizQuestion
 */
export class QuizQuestion {
    constructor(topic, qid, question, code, answerOptions, answerIndex, explanation, hint) {
        this.topic = topic
        this.qid = qid
        this.question = question
        this.code = code
        this.answerOptions = answerOptions
        this.answerIndex = answerIndex
        this.explanation = explanation
        this.hint = hint
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
            explanation: quizQuestion.explanation,
            hint: quizQuestion.hint

        }
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options)
        return new QuizQuestion(data.topic, data.qid, data.question, data.code, data.answer_options, data.answer_index, data.explanation, data.hint)
    }
}

/**
 * Asynchronous Firebase query for module's questions
 * @param {String} moduleName 
 * @returns List of all question objects for that module
 */
export async function getAllModuleQuestions(moduleName) {
    const q = query(collection(db, `quiz-questions/${moduleName}/multiple-choice`))

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
        return null
    }

    const questionList = []

    for (const doc of querySnapshot.docs) {
        questionList.push(quizQuestionConverter.fromFirestore(doc, { idField: "qid" }))
    }

    return questionList
}