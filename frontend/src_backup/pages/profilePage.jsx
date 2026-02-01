import { useEffect, useState } from "react";
import SavedDestinations from "../components/profile/SavedDestinations";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("User"));
        setUser(storedUser);
    }, []);

    if (!user) {
        return <div className="p-8">
            Loading user information...
            {navigate("/auth")}
        </div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            {/* User Info Section */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
            </div>

            {/* Saved Destinations Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Your Saved Destinations</h2>
                <SavedDestinations showRemove={false} /> {/* Hide Remove Button inside profile */}
            </div>
        </div>
    );
};

export default ProfilePage;
