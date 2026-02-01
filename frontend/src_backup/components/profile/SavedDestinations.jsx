import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {savedDestinations.map((dest, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border p-4 rounded shadow hover:shadow-lg transition bg-white relative"
                >
                    {showRemove && (
                        <button
                            onClick={() => handleRemove(dest._id)}
                            className="absolute top-2 right-2 text-red-500 text-xl"
                        >
                            <FaTrash />
                        </button>
                    )}

                    <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        loading="lazy"
                        className="h-40 w-full object-cover mb-4 rounded"
                    />
                    <h2 className="text-xl font-semibold">{dest.name}</h2>
                    <p className="text-gray-600">{dest.location?.city}, {dest.location?.country}</p>
                    <p className="mt-2 text-gray-500">{dest.styles?.join(", ")}</p>
                    <p className="mt-1 font-medium text-indigo-600">${dest.averageCost} average cost</p>
                </motion.div>
            ))}
        </div>
    );
};

export default SavedDestinations;
