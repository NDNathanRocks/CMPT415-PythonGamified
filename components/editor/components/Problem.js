/*import React from "react";


const Problem = ({}) => {

  return (
    <div>
        <p style={{ fontSize: 20 }}> 
        <center>Contional statement</center> 
        </p>
            <center>Write a Python program to convert GPAs to letter grades according to the following table:</center>
            <center>if GPA Equal to 4.33, A+</center>
            <center>if GPA Equal to or larger than 4.00, A</center>
            <center>if GPA Equal to or larger than 3.76, A-</center>
            <center>if GPA Equal to or larger than 3.33, B+</center>
            <center>if GPA Equal to or larger than 3.00, B</center>
            <center>if GPA Equal to or larger than 2.67, B-</center>
            <center>if GPA Equal to or larger than 2.33, C+</center>
            <center>if GPA Equal to or larger than 2.00, C</center>
            <center>if GPA Equal to or larger than 1.67, C-</center>
            <center>if GPA Equal to or larger than 1.33, D</center>
            <center>if GPA Equal to or larger than 1.00, F</center>
    </div>
  );
};
export default Problem;*/

import React from "react";


class Problem extends React.Component {

render() {

  return (
    <div>      
       
        <p style={{ fontSize: 14 }}> 
          {this.props.questionString}
        </p>
        
    </div>
  );
}

}

Problem.defaultProps = {
        
        profilePictureSrc: 'https://example.com/no-profile-picture.jpg',
        questionString: 'Question string .. .. . . . . . .  .. 10 10 10 10 01 01'
};


export default Problem;

