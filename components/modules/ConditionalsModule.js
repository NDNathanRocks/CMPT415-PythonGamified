import handleModuleStart from '../ModulesComponent'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

export default function ConditionalsModule() {
    library.add(fab, fas, far)
    return (
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
    )
}