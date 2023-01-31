import ModulesComponent from "./ModulesComponent";
import ModulesListComponent from "./ModulesListComponent";
import BadgesComponent from "./BadgesComponent";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

export default function HomePageComponent() {
    library.add(fab, fas, far)
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
            <div class="mb-4">
                <BadgesComponent></BadgesComponent>
            </div>
            <div className="row">
                <div className="col">
                    <h3 class="mb-3">Topics</h3>
                </div>
            </div>
            <ModulesListComponent></ModulesListComponent>
        </div>
    )
}