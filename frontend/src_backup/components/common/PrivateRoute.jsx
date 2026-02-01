import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</div>;
    }

    return user ? children : <Navigate to="/auth" replace />;
};
export default PrivateRoute;
