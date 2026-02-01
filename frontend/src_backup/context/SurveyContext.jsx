import { createContext, useContext, useState } from 'react';

const SurveyContext = createContext();
const useSurvey = () => useContext(SurveyContext);
const SurveyProvider = ({ children }) => {
    const [formData, setFormData] = useState({
        user:"",
        travelStyle: "",
        budget: 1000,
        interests: [],
        activities: [],
    });
    const updateForm = (newData) => {
        setFormData((prev) => ({ ...prev, ...newData }));
    }
    return (
        <SurveyContext.Provider value={{ formData, updateForm }}>
            {children}
        </SurveyContext.Provider>
    )
}
export { useSurvey, SurveyProvider }