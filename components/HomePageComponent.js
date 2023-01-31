import ModulesComponent from "./ModulesComponent";
import ModulesListComponent from "./ModulesListComponent";

export default function HomePageComponent() {
    return (
        <div className="container mx-auto">
            <div className="row">
                <div className="col">
                    <button type="button" class="btn btn-success mt-2 mb-4">How to Play</button>
                </div>
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