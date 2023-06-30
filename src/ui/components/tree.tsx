import React, {ReactNode, useState} from "react";

function CollapseIcon({isDeckTreeOpen, handleTriangleClick}: {
    isDeckTreeOpen: boolean,
    handleTriangleClick: Function
}) {
    return (
        <div
            className="tree-item-icon collapse-icon"
            onClick={(e) => handleTriangleClick(e)}
        >
            <svg
                viewBox="0 0 100 100"
                width={10}
                height={10}
                className="right-triangle"
                style={isDeckTreeOpen ? {} : {transform: "rotate(-90deg)"}}
            >
                <path
                    fill="currentColor"
                    stroke="currentColor"
                    d="M94.9,20.8c-1.4-2.5-4.1-4.1-7.1-4.1H12.2c-3,0-5.7,1.6-7.1,4.1c-1.3,2.4-1.2,5.2,0.2,7.6L43.1,88c1.5,2.3,4,3.7,6.9,3.7 s5.4-1.4,6.9-3.7l37.8-59.6C96.1,26,96.2,23.2,94.9,20.8L94.9,20.8z"
                />
            </svg>
        </div>
    );
}

function CollapsibleTreeEntry({renderItem, renderRest}: { renderItem: () => ReactNode; renderRest: () => ReactNode }) {
    const [isDeckTreeOpen, setDeckTreeOpen] = useState(false);

    function handleTriangleClick(e: MouseEvent): void {
        e.preventDefault();
        setDeckTreeOpen(!isDeckTreeOpen);
    }

    return (
        <div className="tree-item">
            <details open={isDeckTreeOpen}>
                <summary
                    className="sr-deck tree-item-self is-clickable"
                    onClick={(e) => e.preventDefault()}
                >
                    <CollapseIcon
                        isDeckTreeOpen={isDeckTreeOpen}
                        handleTriangleClick={(e: MouseEvent) => handleTriangleClick(e)}
                    />
                    {renderItem()}
                </summary>
                <div className="tree-item-children">
                    {renderRest()}
                </div>
            </details>
        </div>
    );
}

function NonCollapsibleTreeEntry({render}: { render: () => ReactNode }) {
    return (
        <div className="tree-item">
            <div className="tree-item-self tag-pane-tag is-clickable">
                {render()}
            </div>
        </div>
    );
}

export function Tree(props: {
    data: any;
    apply: Function;
    render: (t: any) => ReactNode;
    childKey: string;
}) {
    const children = props.data[props.childKey];
    return <>{children.map((child: any, i: number) => {
        if (child[props.childKey]?.length) {
            return (
                <CollapsibleTreeEntry
                    key={i}
                    renderItem={() => props.render(child)}
                    renderRest={() => <Tree data={child} childKey={props.childKey} apply={(d: any) => props.apply(d)}
                                            render={props.render}/>}
                />
            );
        } else {
            return (
                <NonCollapsibleTreeEntry
                    key={i}
                    render={() => props.render(child)}
                />
            );
        }
    })}</>;
}