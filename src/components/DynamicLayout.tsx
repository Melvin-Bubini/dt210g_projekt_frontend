import { useAuth } from "../context/AuthContext"
import LayoutAccess from "./LayoutAccess"
import LayoutNotAccess from "./LayoutNotAccess"
const DynamicLayout = () => {
    const { user } = useAuth();
    return user? <LayoutAccess /> : <LayoutNotAccess />;
};

export default DynamicLayout