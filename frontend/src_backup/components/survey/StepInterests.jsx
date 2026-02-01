import { useSurvey } from "../../context/SurveyContext";

const interestOptions = [
    "Culture",
    "Adventure",
    "Nature",
    "Relaxation",
    "Nightlife",
    "History",
    "Food",
    "Shopping"
];

const StepInterests = () => {
    const { formData, updateForm } = useSurvey();

    const handleCheckbox = (interest) => {
        const currentInterest = formData.interests.includes(interest)
            ? formData.interests.filter((item) => item !== interest)
            : [...formData.interests, interest]
        updateForm({ interests: Array.from(currentInterest) });
    };

    return (
        <div className="fItem">
            <h2 className="text-2xl font-bold mb-4">What are your interests?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {interestOptions.map((interest) => (
                    <label
                        key={interest}
                        className="block cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            // checked={formData.interests?.includes(interest) || false}
                            onChange={() => handleCheckbox(interest)}
                            aria-label={`Select ${interest}`}
                        />
                        <span className="ml-2">{interest}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default StepInterests;