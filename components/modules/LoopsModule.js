import handleModuleStart from '../OpenModuleComponent'

export default function ConditionalsModule() {
    return (
        <div class="card">
            <img src="./images/loops.png" class="card-img-top p-3" alt="loops.png"></img>
            <div class="card-body">
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