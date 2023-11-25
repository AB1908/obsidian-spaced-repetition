import React from "react";
import {Link} from "react-router-dom";

export function ChooseCardType() {
    return (<>
        <p>
            Which type of flashcard?
        </p>

        <ol>
            <Link to={"regular"} >
                <li>
                    Regular
                </li>
            </Link>
            {/*<Link to={"reversed"}>*/}
            {/*    <li>*/}
            {/*        Reversed*/}
            {/*    </li>*/}
            {/*</Link>*/}
            {/*<Link to={"cloze"}>*/}
            {/*    <li>*/}
            {/*        Cloze*/}
            {/*    </li>*/}
            {/*</Link>*/}
        </ol>
    </>);
}