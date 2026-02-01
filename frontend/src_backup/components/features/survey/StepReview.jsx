import { useSurvey } from "../../../context/SurveyContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadForm } from "../../../utils/api";

const StepReview = () => {
    const { formData, updateForm } = useSurvey();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            // Update form with user information
            const User = JSON.parse(localStorage.getItem('User')); // Get User from localStorage
            if (User && User.userId) {
                updateForm({ user: User.userId });
            } else {
                toast.error("User information not found. Please log in.");
                navigate("/yatra"); // Redirect if user not found
                return;
            }

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
        <div className="review-container form-item">
            <form onSubmit={handleSubmit} className="review-form">
                <h2 className="form-title">Review Your Preferences</h2>

                <div className="review-details">
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

                <div className="review-buttons">
                    <button
                        type="submit"
                        className="submit-button"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};
export default StepReview;
