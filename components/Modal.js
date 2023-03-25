import React, {useEffect} from "react";
import ReactDOM from "react-dom";

function Modal (props) {

    if (!props.open) return null
  
    const closeOnEsc = (e) =>{
        if((e.charCode||e.keyCode)===27){
            props.close();
        }
    }

    useEffect(()=>{
        document.body.addEventListener('keydown',closeOnEsc);
        return function cleanup(){
            document.body.removeEventListener('keydown',closeOnEsc)
        }
    },[])

    const MODAL_STYLES = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#FFF',
        padding: '50px',
        zIndex: 1000
    }

    const OVERLAY_STYLES = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, .7)',
        zIndex: 1000
    }
  
    return (
        <>
            <div style={OVERLAY_STYLES}/>
            <div style={MODAL_STYLES}>
                {props.children}
                <button className="btn btn-success mt-2 mb-4" onClick= {props.close}>Close</button>
            </div>
        </>
    )
  }


export default Modal;