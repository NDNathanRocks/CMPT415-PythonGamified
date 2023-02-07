import ModulesComponent from "./ModulesComponent";
import ModulesListComponent from "./ModulesListComponent";
import BadgesComponent from "./BadgesComponent";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useContext } from 'react'
import Context from '../context/Context'
import RecentActivityComponent from './RecentActivityComponent'
import conditionalStatementsJson from '../modules/conditional_statements.json'
import OpenModuleComponent from './OpenModuleComponent'
import EditorComponent from './EditorComponent'
import EasyEditorComponent from './EasyEditorComponent'
import LeaderboardComponent from './LeaderboardComponent'
import SideBar from "./SideBarComponent";

export default function HomePageComponent() {
    library.add(fab, fas, far)
    const { openedModule, setOpenedModule, editorState } = useContext(Context)

    const handleModuleStart = (e) => {
        console.log("here")
        const module = e.currentTarget.getAttribute('module')
        let content;

        // ToDo: Load all modules in modules folder

        if (module === 'conditional_statements') {
            content = conditionalStatementsJson
        } else {
            return
        }

        setOpenedModule({
            id: module,
            json: content
        })
    }

    /**
     * Returns the editor for the module.
     * Can be either an EasyEditorComponent or an EditorComponent.
     */
    const getEditor = () => {
        if (editorState === 0) {
            return (<></>)
        } else if (editorState === 1) {
            return (
                <div className="col-5 position-fixed b-r" style={{right: 0}}>
                    <EditorComponent />
                </div>
            )
        } else if (editorState === 2) {
            return (
                <div className="col-5 position-fixed b-r" style={{right: 0}}>
                    <EasyEditorComponent />
                </div>
            )
        }
    }

    if (openedModule) {
        return (
            <div class="d-flex flex-row justify-content-between">
                <SideBar></SideBar>
                <div className="row flex-grow-1">
                    <div className={editorState === 0 ? "col-100" : "col-7"}>
                        <OpenModuleComponent file={openedModule} />
                    </div>
                    {getEditor()}
                </div>
            </div>
        )
    } else {
        return (
            <div className="container mx-auto ">
                <div class="d-flex justify-content-between">
                        <div className="flex-grow-1">
                            <button type="button" class="btn btn-success mt-2 mb-4">How to Play</button>
                        </div>
                        <div className="flex-shrink-1">
                            <h5 class="mt-2 mb-4">12 <FontAwesomeIcon icon="fa-solid fa-coins" /></h5>
                        </div>
                </div>
                <div class="d-flex flex-row justify-content-between">
                    <div className="flex-grow-1">
                        <div className="row">
                            <div className="col">
                                <h3 class="mb-3">Topics</h3>
                            </div>
                        </div>
                        <div class="row" >
                            <div class="col-sm-6">
                                <div href="#" class="card modules_card" module="conditional_statements" onClick={handleModuleStart}>
                                    <div class="card-body">
                                        <h1 class="d-flex justify-content-center mb-3"><FontAwesomeIcon icon="fa-solid fa-code-branch" /></h1>
                                        <h5 class="card-title">Conditional Statements</h5>
                                        <p class="card-text">This module covers conditional statements.</p>
                                        <span className="profile-modules-progress">
                                            <div className="progress">
                                                <div className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div href="#" class="card modules_card" module="conditional_statements" onClick={handleModuleStart}>
                                    <div class="card-body">
                                        <h1 class="d-flex justify-content-center mb-3"><FontAwesomeIcon icon="fa-solid fa-rotate-left" /></h1>
                                        <h5 class="card-title">Loops</h5>
                                        <p class="card-text">This module covers while loops and for loops.</p>
                                        <span className="profile-modules-progress">
                                            <div className="progress">
                                                <div className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="ps-5 mt-5">
                        <BadgesComponent></BadgesComponent>
                    </div>
                </div>
            </div>
        )
    }
}