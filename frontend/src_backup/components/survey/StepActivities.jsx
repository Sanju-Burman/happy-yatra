import { useSurvey } from "../../context/SurveyContext";

const activityOptions = [
    "Sightseeing",
    "Dining",
    "Outdoor Adventures",
    "Museums",
    "Beaches",
    "Hiking",
    "Shopping",
    "Spa & Wellness"
];

const StepActivities = () => {
    const { formData, updateForm } = useSurvey();

    const handleCheckbox = (activity) => {
        const currentActivities = formData.activities.includes(activity)
            ? formData.activities.filter((item) => item !== activity)
            : [...formData.activities,activity]
        updateForm({activities: Array.from(currentActivities) });
    };

    return (
        <div className="fItem">
            <h2 className="text-2xl font-bold mb-4">What activities do you enjoy?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {activityOptions.map((activity) => (
                    <label
                        key={activity}
                        className="block cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            // checked={formData.activities?.includes(activity)}
                            onChange={() => handleCheckbox(activity)}
                            aria-label={`Select ${activity}`}
                        />
                        <span className="ml-2">{activity}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default StepActivities;