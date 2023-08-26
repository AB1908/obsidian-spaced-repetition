import {NavLink, Outlet} from "react-router-dom";
import React from "react";

export function Tabs() {
    return (
        <>
            <div className={"sr-tab-nav"}>
                <NavLink to="/tags" className={"sr-nav-link is-clickable"}>
                    Tags
                </NavLink>
                <NavLink to="/books" className={"sr-nav-link is-clickable"}>
                    Notes
                </NavLink>
            </div>
            <Outlet/>
        </>
    );
}