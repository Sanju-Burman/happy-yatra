import { useEffect, useState } from "react";
import { motion } from "motion/react"
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const SavedDestinations = ({ showRemove = true }) => {
    const [savedDestinations, setSavedDestinations] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("savedDestinations")) || [];
        setSavedDestinations(saved);
    }, []);

    const handleRemove = (id) => {
        const updatedSaved = savedDestinations.filter(dest => dest._id !== id);
        localStorage.setItem("savedDestinations", JSON.stringify(updatedSaved));
        setSavedDestinations(updatedSaved);
        toast.success("Destination removed!");
    };

    if (savedDestinations.length === 0) {
        return <p>You have no saved destinations yet.</p>;
    }

    return (
        <div>
            {savedDestinations.map((dest, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    >
                    {showRemove && (
                        <button
                            onClick={() => handleRemove(dest._id)}
                        >
                            <FaTrash />
                        </button>
                    )}

                    <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        loading="lazy"
                    />
                    <h2>{dest.name}</h2>
                    <p>{dest.location?.city}, {dest.location?.country}</p>
                    <p>{dest.styles?.join(", ")}</p>
                    <p>${dest.averageCost} average cost</p>
                </motion.div>
            ))}
        </div>
    );
};

export default SavedDestinations;
