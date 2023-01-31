import handleModuleStart from '../OpenModuleComponent'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

export default function ConditionalsModule() {
    library.add(fab, fas, far)
    return (
        <div class="card">
            <div class="card-body">
                <h1 class="d-flex justify-content-center mb-3"><FontAwesomeIcon icon="fa-solid fa-rotate-left" /></h1>
                <h5 class="card-title">Loops</h5>
                <p class="card-text">This module covers while loops and for loops.</p>
                <span className="profile-modules-progress">
                    <div className="progress">
                        <div className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </span>
                <div class="d-flex justify-content-around mt-3">
                    <a href="#" className="btn btn-primary" module="conditional_statements" onClick={handleModuleStart}>Start</a>
                    <a href="#" className="btn btn-primary disabled">Review</a>
                    <a href="#" className="btn btn-primary disabled">Compete</a>
                </div>
            </div>
        </div>
    )
}