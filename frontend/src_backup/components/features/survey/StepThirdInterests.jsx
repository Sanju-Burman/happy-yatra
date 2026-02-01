import { useSurvey } from "../../../context/SurveyContext";

const StepThirdInterests = () => {
    const { formData, updateForm } = useSurvey();
    const interestOptions = [
        "Culture", "Adventure", "Nature", "Relaxation",
        "Nightlife", "History", "Food", "Shopping"
    ];

    const handleCheckbox = (interest) => {
        const currentInterests = formData.interests || []; // Ensure it's an array
        const updatedInterests = currentInterests.includes(interest)
            ? currentInterests.filter((item) => item !== interest)
            : [...currentInterests, interest];
        updateForm({ interests: updatedInterests });
    };

    return (
        <div className="form-item">
            <h2 className="form-title">What are your interests?</h2>
            <div className="options-grid checkbox-grid">
                {interestOptions.map((interest) => (
                    <label
                        key={interest}
                        className="checkbox-label"
                    >
                        <input
                            type="checkbox"
                            checked={formData.interests?.includes(interest) || false}
                            onChange={() => handleCheckbox(interest)}
                            aria-label={`Select ${interest}`}
                            className="checkbox-input"
                        />
                        <span className="checkbox-text">{interest}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default StepThirdInterests;
