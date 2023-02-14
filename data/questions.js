import { db } from '../firebase'
import { query, collection, where, getDocs,  orderBy } from 'firebase/firestore'
import { v4 as uuidv4 } from "uuid"

/**
 * Represents a Coce Questions in the system
 * 
 * @typedef {Object} QuestionC
 */
 export class questions {
    constructor(uuid, questionFiller, questionString, questionTitle, questionID, questionCode,questionAnswer,questionType,questionHint) {
        this.uuid = uuid
        this.questionFiller = questionFiller
        this.questionString= questionString
        this.questionTitle= questionTitle
        this.questionID = questionID
        this.questionCode = questionCode
        this.questionAnswer = questionAnswer
        this.questionType = questionType
        this.questionHint = questionHint
    }
}

/**
 * Converts between the Coce Questions class schema and
 * the firebase schema
 */
 const QuestionCConverter = {
    toFirestore: function (questions) {
        return {
            uuid: questions.uuid,
            questionFiller: questions.questionFiller,
            questionString: questions.questionString,
            questionTitle: questions.questionTitle,
            questionID: questions.questionID,
            questionCode: questions.questionCode,
            questionAnswer: questions.questionAnswer,
            questionType: questions.questionType,
            questionHint: questions.questionHint,
        }
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options)
        return new questions(data.uuid, data.questionFiller, data.questionString, data.questionTitle, data.questionID, data.questionCode,data.questionAnswer,data.questionType,data.questionHint)
    }
}


/**
 * Returns a list of all discussions in descending order
 * @returns {QuestionC[]}
 */
export async function getQuestionCList() {
    const q = query(collection(db, "questions"))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return null
    }

    const QuestionC = []

    for (const doc of querySnapshot.docs) {
        QuestionC.push(new questions(doc.id,doc.data().questionFiller, doc.data().questionString, doc.data().questionTitle, doc.data().questionID, doc.data().questionCode,doc.data().questionAnswer,doc.data().questionType,doc.data().questionHint))
    }

    return QuestionC
}

/**
 * Returns a discussion post by its uuid
 * @param {String} uuid 
 * @returns Question
 */
export async function getQuestionU(uuid) {
    const q = query(collection(db, "questions"), where("uuid", "==", uuid))

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
        return null
    }

    return QuestionCConverter.fromFirestore(querySnapshot.docs[0], { idField: "uuid" })
}

/**
 * Returns a question's uuid by its "questionID"
 * @param {String} questionID
 * @returns Question
 */
export async function getQuestionUUID(questionID) {
    const q = query(collection(db, "questions"), where("questionID", "==", questionID))

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
        return null
    }

    return QuestionCConverter.fromFirestore(querySnapshot.docs[0], { idField: "uuid" })
}