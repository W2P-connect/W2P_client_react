const RenderIf = ({ condition, children }) => {
    if (condition && condition !== undefined) {
        return <>{children}</>;
    } else {
        return null;
    }
};

export default RenderIf;
