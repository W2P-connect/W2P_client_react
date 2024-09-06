import { ReactNode } from "react";

const RenderIf = ({ condition, children }: {
    condition: boolean,
    children: ReactNode
}) => {
    if (condition && condition !== undefined) {
        return <>{children}</>;
    } else {
        return null;
    }
};

export default RenderIf;
