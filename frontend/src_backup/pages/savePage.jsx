import SavedDestinations from "../components/profile/SavedDestinations";

const SavedPage = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Your Saved Destinations</h1>
            <SavedDestinations showRemove={true} />
        </div>
    );
};

export default SavedPage;
