import { useContext } from "react";
import AuthContext from "./authContextBase";

export const useAuth = () => {
    return useContext(AuthContext);
};