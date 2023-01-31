import handleModuleStart from '../OpenModuleComponent'

export default function ConditionalsModule() {
    return (
        <div class="card">
            <img src="./images/conditionals.png" class="card-img-top p-3" alt="conditionals.png"></img>
            <div class="card-body">
                <h5 class="card-title">Conditional Statements</h5>
                <p class="card-text">This module covers conditional statements.</p>
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