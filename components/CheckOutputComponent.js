import React, { useContext } from "react";
import Context from "../context/Context";

function CheckOutputComponent(props) {

    const { challengeNumber, challengeData } = useContext(Context)

    // const prompt = props.prompt;
    const output = props.output;
    if (challengeData) {
        var ans = challengeData[challengeNumber].answer;
    } else {
        var ans = "";
    }
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