import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../../../styles/recom.css"
import DestinationMap from "./DestinationMap"
import { fetchDestinations } from "../../../utils/api";

const Recommendation = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem("surveyData"));
        const fetchData = async () => {
            try {
                const destinationData = await fetchDestinations();

                // console.log("Destination Data:", destinationData);
                // console.log("Stored Data:", storedData);

                if (storedData) {
                    const recomData = destinationData.filter((dest) => {
                        const matchesStyle = dest.styles?.some(style => style.toLowerCase() === storedData.travelStyle.toLowerCase());
                        const matchesBudget = dest.averageCost <= storedData.budget;
                        const matchesInterest = dest.tags?.some(tag => storedData.interests?.map(i => i.toLowerCase()).includes(tag.toLowerCase()));
                        const matchesActivity = dest.activities?.some(act => storedData.activities?.map(a => a.toLowerCase()).includes(act.toLowerCase()));

                        // console.log("Matches:", matchesStyle, matchesBudget, matchesInterest, matchesActivity);

                        return matchesStyle || matchesBudget || matchesInterest || matchesActivity;
                    });

                    // console.log("Filtered Recommendations:", recomData);
                    setRecommendations(recomData); // Update recommendations
                } else {
                    setRecommendations(destinationData); // Show all destinations if no survey data
                }
            } catch (error) {
                console.error("Error fetching recommendations:", error);
                toast.error("Something went wrong while fetching recommendations.");
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Call the fetch function
    }, []);
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Recommended Destinations</h1>
            {loading ? (
                <p>Loading recommendations...</p>
            ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.map((dest, idx) => (
                        <div key={idx} className="border p-4 rounded shadow hover:shadow-lg transition">
                            <h2 className="text-2xl font-bold mb-4">Explore Destinations</h2>
                            <DestinationMap destination={dest} />
                            <img
                                src={dest.imageUrl}
                                alt={dest.name}
                                className="h-40 w-full object-cover mb-4 rounded"
                            />
                            <h2 className="text-xl font-semibold">{dest.name}</h2>
                            <p className="text-gray-600">{dest.location}</p>
                            <p className="mt-2 text-gray-500">{dest.styles?.join(", ")}</p>
                            <p className="mt-1 font-medium text-indigo-600">${dest.averageCost} average cost</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No destinations found. Try adjusting your preferences!</p>
            )}
        </div>
    );
};

export default Recommendation;
