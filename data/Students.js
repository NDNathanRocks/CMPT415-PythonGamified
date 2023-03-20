import { db } from '../firebase'
import { collection, query, where, getDocs, getDoc, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Friendship } from '../context/Friendship'

/**
 * Represents a student in the system
 * 
 * @typedef {Object} Student
 */
export class Student {
    constructor(uuid, name, email, anonymousName, isAnonymous, achievements, level, friends, score, solved_question, question_hint) {
        this.uuid = uuid
        this.name = name
        this.email = email
        this.anonymousName = anonymousName
        this.isAnonymous = isAnonymous
        this.achievements = achievements
        this.level = level
        this.friends = friends
        this.score = score
        this.solved_question = []
        this.question_hint = []
    }
}

/**
 * Converts between the Student class schema and
 * the firebase schema
 */
const studentConverter = {
    toFirestore: function (student) {
        return {
            uuid: student.uuid,
            name: student.name,
            email: student.email,
            anonymous_name: student.anonymousName,
            is_anonymous: student.isAnonymous,
            achievements: student.achievements,
            level: student.level,
            friends: student.friends,
            score: student.score,
            solved_question : student.solved_question,
            question_hint: student.question_hint
        }
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options)
        return new Student(data.uuid, data.name, data.email, data.anonymous_name, data.is_anonymous, data.achievements, data.level, data.friends, data.score, data.solved_question, data.question_hint)
    }
}

/**
 * Returns a student by email
 * @param {string} email 
 * @returns Student
 */
export async function getStudent(email) {
    const q = query(collection(db, "students"), where("email", "==", email))

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
        return null
    }

    return studentConverter.fromFirestore(querySnapshot.docs[0], { idField: "uuid" })
}

/**
 * Returns a student by uuid
 * @param {string} uuid 
 * @returns Student
 */
 export async function getStudentById(uuid) {
    const q = query(collection(db, "students"), where("uuid", "==", uuid))

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
        return null
    }

    return studentConverter.fromFirestore(querySnapshot.docs[0], { idField: "uuid" })
}

/**
 * Creates a new student
 * @param {Student} student 
 * @returns Student if created, false if already exists
 */
export async function createStudent(student) {
    const q = query(collection(db, "students"), where("email", "==", student.email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        await setDoc(doc(db, "students", student.uuid), studentConverter.toFirestore(student))
        return student
    }

    return false
}

/**
 * Checks if a student has an achievement
 * @param {Student} student 
 * @param {Achievement ID} achievement 
 * @returns true if the student has the achievement, false otherwise
 */
export async function checkStudentHasAchievement(student, achievement) {
    const q = query(collection(db, "students"), where("email", "==", student.email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()

    return studentData.achievements.includes(achievement)
}

/**
 * Awards an achievement to a student
 * @param {Student} student 
 * @param {Achievement ID} achievement 
 * @returns false if the student has the achievement or does not exist, true otherwise
 */
export async function giveStudentAchievement(student, achievement) {
    const q = query(collection(db, "students"), where("email", "==", student.email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const achievements = studentData.achievements

    if (!achievements.includes(achievement)) {
        achievements.push(achievement)
        await updateDoc(studentDoc.ref, { achievements: achievements })

        return true
    }
    
    return false
}

/**
 * Adds to a student's score
 * @param {Student} student 
 * @returns {Boolean} true if score was successfully changed, false otherwise
 */
 export async function getStudentScore(student) {
    const q = query(collection(db, "students"), where("email", "==", student.email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const currentScore = studentData.score

    return String(currentScore)
}


/**
 * Adds to a student's score
 * @param {Student} student 
 * @param {Number} score 
 * @returns {Boolean} true if score was successfully changed, false otherwise
 */
export async function giveStudentScore(student, score) {
    const q = query(collection(db, "students"), where("email", "==", student.email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const currentScore = studentData.score

    await updateDoc(studentDoc.ref, { score: currentScore + score })

    return true
}

/**
 * Adds to a student's score
 * @param {Student} student 
 * @param {Number} score 
 * @returns {Boolean} true if score was successfully changed, false otherwise
 */
 export async function takeStudentScore(student, score) {
    const q = query(collection(db, "students"), where("email", "==", student.email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const currentScore = studentData.score

    await updateDoc(studentDoc.ref, { score: currentScore - score })

    return true
}


/**
 * Adds to a student's score
 * @param {Student} student 
 * @param {Number} score 
 * @returns {Boolean} true if score was successfully changed, false otherwise
 */
 export async function solvedQuestionUpdate(student, title, questionNumber) {
    const q = query(collection(db, "students"), where("email", "==", student.email))
    console.log("1")
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const currentQuestion = studentData.solved_question
    const len = currentQuestion.length
    var flag = false
    var num = -1
    console.log("length", len)
    for (let i = 0; i < len; i++) {
        if (currentQuestion[i]['title'] == title) {
            console.log("2")
            flag = true
            num = i
        }
    }
    if (flag) {
        console.log("here2222")
        console.log(currentQuestion[num]['l'])
        console.log("question", questionNumber)
        for(let i = 0; i < currentQuestion[num]['l'].length; i++) {
            if(currentQuestion[num]['l'][i] == questionNumber) {
                // console.log("3")
                return true
            }
            else {
                console.log("HIHIHI 4")
                currentQuestion[num]['l'].push(questionNumber)
                console.log(currentQuestion[num]['l'])
                await updateDoc(studentDoc.ref, { solved_question: currentQuestion })
                return true
            }
        }
        // if (questionNumber in currentQuestion[num]['l']) {
        //     console.log("3")
        //     return true
        // }

    }
    else {
        console.log("here3333")
        const l = [questionNumber]
        currentQuestion.push({
            title, l
        })
        await updateDoc(studentDoc.ref, { solved_question: currentQuestion })
        return true
    }
    // console.log("heeeee")
    // console.log(currentQuestion)
    // await updateDoc(studentDoc.ref, { solved_question: currentQuestion })
    // console.log(studentData.solved_question)
    return false
}

/**
 * Adds to a student's score
 * @param {Student} student 
 * @param {Number} score 
 * @returns {Boolean} true if score was successfully changed, false otherwise
 */
 export async function solvedQuestionCheck(student, title, questionNumber) {
    const q = query(collection(db, "students"), where("email", "==", student.email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const currentQuestion = studentData.solved_question
    // console.log("current", currentQuestion[0]['l'][3])
    const len = currentQuestion.length
    var flag = false
    var num = -1
    // console.log("length", len)
    for (let i = 0; i < len; i++) {
        if (currentQuestion[i]['title'] == title) {
            flag = true
            num = i
        }
    }
    if (flag) {
        var check = false
        for(let i = 0; i < currentQuestion[num]['l'].length; i++) {
            if (questionNumber == currentQuestion[num]['l'][i]) {
                check = true
            } 
        }
        if (check) {
            return true
        }
        else {
            return false
        }
    }
    return false
}

/**
 * Updates whether a question's hint has been bought or not
 * @param {Student} student 
 * @param {String} title
 * @param {Number} questionNumber 
 * @param {Boolean} newVal
 * @returns {Boolean} true if hint was successfully updated, false otherwise
 */
export async function questionHintUpdate(student, title, questionNumber, newVal) {
    const q = query(collection(db, "students"), where("email", "==", student.email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const currentQuestion = studentData.question_hint

    // Switch values from true/false to 0/1
    var updateVal = 0
    if (newVal) {
        updateVal = 1
    }

    // If question number is outside of array size, append array
    if (currentQuestion[title].length <= questionNumber) {
        currentQuestion[title].append(updateVal)
    } else {
        // Update whether hint is bought or not
        currentQuestion[title][questionNumber] = updateVal
    }

    // Update firebase with changes
    await updateDoc(studentDoc.ref, { question_hint: currentQuestion })

    return true

}

/**
 * Check whether a question's hint has been bought or not
 * @param {Student} student 
 * @param {String} title
 * @param {Number} questionNumber 
 * @returns {Boolean} true if hint was bought, false otherwise
 */
export async function questionHintCheck(student, title, questionNumber) {
    const q = query(collection(db, "students"), where("email", "==", student.email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const currentQuestion = studentData.question_hint

    // If question number is outside of array size, return false 
    if (currentQuestion[title].length <= questionNumber) {
        return false
    }

    // If a 1 for that question hint is found that means the hint has been bought already
    if (currentQuestion[title][questionNumber] == 1) {
        return true
    }

    return false
}



/**
 * Returns ids of all students the user has the status with
 * @param {Student} student 
 * @param {Number} status 
 * @returns {[String]} students with the given relationship status
 */
export async function getFriendsIds(student, status) {
    if (status < Friendship.NONE || status > Friendship.REJECTED) {
        return []
    }

    const oneWayQ = query(collection(db, "relationships"), where("from", "==", student.uuid), where("status", "==", status))
    const twoWayQ = query(collection(db, "relationships"), where("to", "==", student.uuid), where("status", "==", status))

    const oneWaySnapshot = await getDocs(oneWayQ)
    const twoWaySnapshot = await getDocs(twoWayQ)

    const oneWayData = oneWaySnapshot.docs.map(doc => doc.data())
    const twoWayData = twoWaySnapshot.docs.map(doc => doc.data())

    const friendsOneWay = oneWayData.map(data => data.to)
    const friendsTwoWay = twoWayData.map(data => data.from)

    const friends = friendsOneWay.concat(friendsTwoWay)

    return friends
}

/**
 * Returns the students that the user has the status with
 * @param {Student} student 
 * @param {Int} status 
 * @returns {[Student]} students with the given relationship status
 */
export async function getFriends(student, status) {
    const friendsIds = await getFriendsIds(student, status)

    const friends = []

    for (const id of friendsIds) {
        const friend = await getStudentById(id)
        friends.push(friend)
    }

    return friends
}

/**
 * Checks if two students share a relationship status
 * @param {Student} student 
 * @param {String} friendId 
 * @param {Number} status 
 * @returns {Boolean} true if the relationship exists, false otherwise
 */
export async function checkFriendship(student, friendId, status) {
    const friendIds = await getFriendsIds(student, status)

    if (friendIds.length === 0) return false

    return friendIds.includes(friendId)
}

/**
 * Sets the relationship status between two students
 * @param {String} student1 
 * @param {String} student2 
 * @param {Number} status 
 */
export async function setRelationshipStatus(student1, student2, status) {
    const firstQ = query(collection(db, "relationships"), where("from", "==", student1), where("to", "==", student2))
    const secondQ = query(collection(db, "relationships"), where("from", "==", student2), where("to", "==", student1))

    const firstSnapshot = await getDocs(firstQ)
    const secondSnapshot = await getDocs(secondQ)

    if (firstSnapshot.empty && secondSnapshot.empty) {
        await setDoc(doc(db, "relationships", uuid()), {
            from: student1,
            to: student2,
            sent: serverTimestamp,
            responded: serverTimestamp,
            status: status
        })

        return
    }

    if (firstSnapshot.empty) {
        const secondDoc = secondSnapshot.docs[0].ref
        await updateDoc(secondDoc, { status: status })
        return
    }

    if (secondSnapshot.empty) {
        const firstDoc = firstSnapshot.docs[0].ref
        await updateDoc(firstDoc, { status: status })
        return
    }
}

export async function getStudentAnswers(student, question) {
    const docRef = doc(db, "answers", student.uuid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data())
    } else {
        console.log("No such document!")
    }
}


/**
 * Adds to a student's score
 * @param {Student} student 
 * @param {Number} score 
 * @returns {Boolean} true if score was successfully changed, false otherwise
 */
 export async function giveStudentScoreCode(email, score) {
    const q = query(collection(db, "students"), where("email", "==", email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const currentScore = studentData.score

    await updateDoc(studentDoc.ref, { score: currentScore + score })

    return true
}

/**
 * Adds to a student's score
 * @param {Student} student 
 * @param {Number} score 
 * @returns {Boolean} true if score was successfully changed, false otherwise
 */
 export async function takeStudentScoreCode(email, score) {
    const q = query(collection(db, "students"), where("email", "==", email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const currentScore = studentData.score

    await updateDoc(studentDoc.ref, { score: currentScore - score })

    return true
}

/**
 * Adds to a student's score
 * @param {Student} student 
 * @returns {Boolean} true if score was successfully changed, false otherwise
 */
 export async function getStudentScoreCode(email) {
    const q = query(collection(db, "students"), where("email", "==", email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        return false
    }

    const studentDoc = querySnapshot.docs[0]

    const studentData = studentDoc.data()
    const currentScore = studentData.score

    return String(currentScore)
}