import ConditionalsModule from "./modules/ConditionalsModule";
import LoopsModule from "./modules/LoopsModule"

export default function ModulesListComponent() {
    return (
        <div class="row" >
            <div class="col-sm-6">
                <ConditionalsModule></ConditionalsModule>
            </div>
            <div class="col-sm-6">
                <LoopsModule></LoopsModule>
            </div>
        </div>
    )
}