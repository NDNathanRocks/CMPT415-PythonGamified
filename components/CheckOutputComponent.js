import React, { useContext } from "react";
import Context from "../context/Context";
import { solvedQuestionUpdate } from "../data/ChallengeQuestions"

function CheckOutputComponent(props) {

    const { challengeNumber, challengeQuestion } = useContext(Context)

    const output = props.output;
    const moduleName = props.moduleName;
    var ans = challengeQuestion.find(x => x.id === moduleName).questions.find(x => x.id === challengeNumber).answer.toLowerCase().replace(/(\r\n|\n|\r)/gm, "");
   
    if (typeof output.at(-1) == 'string') {
        var userAns = output.at(-1).toLowerCase().replace(/(\r\n|\n|\r)/gm, "");
    }
  
    return(
        <div>
            {   
                userAns === ans ? '✅' : '❌'
            }
        </div>
    )
}

export default CheckOutputComponent;

// ' ❌ '
//             