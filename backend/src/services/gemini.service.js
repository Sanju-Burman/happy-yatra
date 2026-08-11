const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * GeminiService
 * Handles communication with Google Gemini API to retrieve structured destination recommendations.
 */
class GeminiService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('WARNING: GEMINI_API_KEY is not defined in the environment variables.');
        }
        this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
        this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        this.temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7');
        this.maxTokens = parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '4096', 10);
    }

    /**
     * Call Gemini to recommend exactly 10 destinations based on user survey data.
     * @param {Object} survey - The user's survey response object
     * @returns {Promise<Array<Object>>} List of 10 recommended destinations
     */
    async getRecommendations(survey) {
        if (!this.genAI) {
            throw new Error('Gemini API key is missing. Please configure GEMINI_API_KEY in your .env file.');
        }

        const { travelStyle, budget, interests, activities } = survey;

        // Map budget to a text representation for prompt clarity
        const budgetMap = {
            1: 'Budget-friendly / Backpacker (Low cost, hostels, public transit, street food)',
            2: 'Moderate (Mid-range hotels, local tours, balanced spending)',
            3: 'Premium (High-end boutique hotels, elevated dining, curated private tours)',
            4: 'Luxury (Ultra luxury resorts, private guides, fine dining, exclusive experiences)'
        };

        const budgetDescription = budgetMap[budget] || 'Moderate';

        const prompt = `You are an expert travel concierge assistant. Based on the user's travel profile, recommend exactly 10 specific destinations.

User Travel Profile:
- Travel Style: ${travelStyle} (e.g. Solo, Couple, Family, Friends, Business)
- Budget Level: ${budgetDescription}
- Interests: ${interests.join(', ')}
- Preferred Activities: ${activities.join(', ')}

Output Format Requirements:
- You must output a JSON array containing exactly 10 destinations. Do not include markdown code block formatting like \`\`\`json. Output ONLY the raw JSON string.
- Each destination object in the array must strictly conform to the following schema:
{
  "name": "The name of the destination (e.g. Kyoto, Banff National Park, Maui)",
  "location": "The city/state/region and country (e.g. Japan, Alberta, Canada, Hawaii, USA)",
  "latitude": number (floating point latitude, e.g. 35.0116),
  "longitude": number (floating point longitude, e.g. 135.7681),
  "averageCost": number (Estimated average cost per day in USD as a number, e.g. 80, 150, 450),
  "styles": ["A list of travel styles this fits. Include the user's style '${travelStyle}' and other relevant ones"],
  "tags": ["A list of interests/tags this destination meets. Include relevant ones from: ${interests.join(', ')}"],
  "activities": ["A list of specific activities to do there. Include relevant ones from: ${activities.join(', ')}"],
  "imageUrl": "A valid public Unsplash image URL representative of this destination (e.g. https://images.unsplash.com/photo-... or a high-quality travel image link)",
  "description": "A compelling 2-3 sentence description explaining why this destination matches the user's interests, budget, and travel style."
}

Ensure the 10 recommendations are diverse and align beautifully with the user's budget and interests. Check that coordinates (latitude and longitude) are geographically accurate for the recommended location.`;

        const model = this.genAI.getGenerativeModel({ model: this.modelName });

        const response = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: this.temperature,
                maxOutputTokens: this.maxTokens
            }
        });

        const textResponse = response.response.text();
        if (!textResponse) {
            throw new Error('Received empty response from Gemini API');
        }

        let parsedData;
        try {
            parsedData = JSON.parse(textResponse);
        } catch (e) {
            console.error('Failed to parse Gemini JSON response:', textResponse);
            throw new Error('Gemini response could not be parsed as valid JSON: ' + e.message);
        }

        return this.validateAndNormalizeResponse(parsedData);
    }

    /**
     * Validates structural requirements and normalizes the parsed response array.
     */
    validateAndNormalizeResponse(data) {
        if (!Array.isArray(data)) {
            throw new Error('Gemini response is not a JSON array');
        }

        if (data.length === 0) {
            throw new Error('Gemini response returned 0 recommendations');
        }

        // We want exactly 10, but let's be slightly forgiving if it returned 8-12.
        // Let's slice/limit to max 10 or pad if needed, but validation should check structure.
        const normalized = data.map((item, index) => {
            if (!item.name || typeof item.name !== 'string') {
                throw new Error(`Destination at index ${index} is missing a valid name`);
            }
            if (!item.location || typeof item.location !== 'string') {
                throw new Error(`Destination "${item.name}" is missing a valid location`);
            }

            // Parse and validate coordinates
            let lat = parseFloat(item.latitude);
            let lng = parseFloat(item.longitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                // Default fallback if coords are bad
                lat = 0;
            }
            if (isNaN(lng) || lng < -180 || lng > 180) {
                lng = 0;
            }

            // Cost
            let cost = parseFloat(item.averageCost);
            if (isNaN(cost) || cost < 0) {
                cost = 100; // default fallback
            }

            // Image URL validation/fallback
            let imgUrl = item.imageUrl || '';
            if (!imgUrl || !imgUrl.startsWith('http')) {
                imgUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'; // high quality fallback
            }

            return {
                name: item.name.trim(),
                location: item.location.trim(),
                latitude: lat,
                longitude: lng,
                averageCost: cost,
                styles: Array.isArray(item.styles) && item.styles.length > 0 ? item.styles.map(s => String(s).trim()) : ['Travel'],
                tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags.map(t => String(t).trim()) : ['General'],
                activities: Array.isArray(item.activities) && item.activities.length > 0 ? item.activities.map(a => String(a).trim()) : ['Explore'],
                imageUrl: imgUrl.trim(),
                description: item.description ? String(item.description).trim() : `Explore the beautiful city of ${item.name} in ${item.location}.`
            };
        });

        // Ensure we return exactly 10, or up to 10.
        return normalized.slice(0, 10);
    }
}

module.exports = new GeminiService();
