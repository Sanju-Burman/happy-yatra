import { useSurvey } from "../../../context/SurveyContext";

const StepFourthActivities = () => {
    const { formData, updateForm } = useSurvey();
    const activityOptions = [
        "Sightseeing", "Dining", "Outdoor Adventures", "Museums",
        "Beaches", "Hiking", "Shopping", "Spa & Wellness"
    ];

    const handleCheckbox = (activity) => {
        const currentActivities = formData.activities || []; // Ensure it's an array
        const updatedActivities = currentActivities.includes(activity)
            ? currentActivities.filter((item) => item !== activity)
            : [...currentActivities, activity];
        updateForm({ activities: updatedActivities });
    };

    return (
        <div className="form-item">
            <h2 className="form-title">What activities do you enjoy?</h2>
            <div className="options-grid checkbox-grid">
                {activityOptions.map((activity) => (
                    <label
                        key={activity}
                        className="checkbox-label"
                    >
                        <input
                            type="checkbox"
                            checked={formData.activities?.includes(activity) || false}
                            onChange={() => handleCheckbox(activity)}
                            aria-label={`Select ${activity}`}
                            className="checkbox-input"
                        />
                        <span className="checkbox-text">{activity}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};
export default StepFourthActivities;
