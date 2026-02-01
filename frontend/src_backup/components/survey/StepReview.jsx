import { useSurvey } from "../../context/SurveyContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadForm } from "../../utils/api";

const StepReview = () => {
    const { formData,updateForm} = useSurvey();
    const User = JSON.parse(localStorage.getItem('User'));
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            // Update form with user information
            updateForm({ user: User.userId });

            // API call to submit survey form
            const response = await uploadForm(formData);

            // Check for success response
            if (response.status === 201) {
                toast.success("Survey submitted successfully!");
                navigate("/thanku");
            } else {
                toast.error("Unexpected response. Please try again.");
                console.warn("Unexpected response status:", response.status);
            }
        } catch (err) {
            // Handle submission error
            toast.error("Submission failed. Please try again later.");
            console.error("Error submitting survey:", err);
        }
    };

    return (
        <div className="max-w-xl mx-auto fItem">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 p-6">
                <h2 className="text-2xl font-bold mb-4">Review Your Preferences</h2>

                <div className="space-y-3 mb-6">
                    <div>
                        <strong>Travel Style:</strong> {formData.travelStyle || "Not selected"}
                    </div>
                    <div>
                        <strong>Budget:</strong> {formData.budget ? `$${formData.budget}` : "Not specified"}
                    </div>
                    <div>
                        <strong>Interests:</strong> {formData.interests?.length > 0 ? formData.interests.join(", ") : "None"}
                    </div>
                    <div>
                        <strong>Activities:</strong> {formData.activities?.length > 0 ? formData.activities.join(", ") : "None"}
                    </div>
                </div>

                <div className="flex gap-4 justify-between">
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StepReview;