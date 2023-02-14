import { db } from '../firebase'
import { collection, query, where, getDocs, getDoc, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Friendship } from '../context/Friendship'

/**
 * Represents a student in the system
 * 
 * @typedef {Object} Quiz
 */
export class Quiz {
    constructor(uuid, quiz1, quiz2, quiz3) {
        this.uuid = uuid
        this.quiz1 = quiz1
        this.quiz2 = quiz2
        this.quiz3 = quiz3
    }
}

/**
 * Converts between the Student class schema and
 * the firebase schema
 */
const quizConverter = {
    toFirestore: function (student) {
        return {
            uuid: Quiz.uuid,
            condition1: Quiz.quiz1,
            condition2: Quiz.quiz2,
            condition3: Quiz.quiz3
        }
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options)
        return new Quiz(data.uuid, data.quiz1, data.quiz2, data.quiz3)
    }
}

/**
 * Returns a student by uuid
 * @param {string} uuid 
 * @returns Student
 */
 export async function getQuizById(uuid) {
    const q = query(collection(db, "quizs"), where("uuid", "==", uuid))

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
        return null
    }

    return quizConverter.fromFirestore(querySnapshot.docs[0], { idField: "uuid" })
}

