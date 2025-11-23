
import { GoogleGenAI, Type } from "@google/genai";
import { MealPlan, KanbanTask, Meal, MealPlannerSettings } from '../types';

const getAiInstance = () => {
    // Support both Vite (import.meta.env) and standard Node (process.env)
    const apiKey = import.meta.env.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);
    
    if (!apiKey) {
        console.error("API Key is missing. Please add VITE_API_KEY to your .env file or Vercel project settings.");
        throw new Error("API_KEY is not configured.");
    }
    return new GoogleGenAI({ apiKey });
};

export const getMealPlanStream = (settings: MealPlannerSettings, goalInput: string, daysToGenerate?: string[]) => {
    const ai = getAiInstance();
    
    const days = daysToGenerate && daysToGenerate.length > 0 
        ? daysToGenerate 
        : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const prompt = `
      Create a daily meal plan based on the following profile:
      - Target Calories: ${settings.calorieTarget}
      - Target Protein: ${settings.proteinTarget}g
      - Diet Type: ${settings.dietType}
      - Allergies/Exclusions: ${settings.allergies || 'None'}
      
      Specific Weekly Request/Goal: "${goalInput}"

      The output must be a JSON object.
      Only generate plans for the following days: ${days.join(', ')}.
      Each day should contain "breakfast", "lunch", and "dinner" keys.
      Each meal object must have "name", "description", "calories", and "protein" (in grams).
      Do not include any other text or markdown formatting.
    `;
    
    const mealProperties = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the meal." },
          description: { type: Type.STRING, description: "Brief description of the meal." },
          calories: { type: Type.INTEGER, description: "Calorie count for the meal." },
          protein: { type: Type.INTEGER, description: "Protein content in grams." },
        },
        required: ["name", "description", "calories", "protein"],
      };
  
      const dayProperties = {
          type: Type.OBJECT,
          properties: {
              breakfast: mealProperties,
              lunch: mealProperties,
              dinner: mealProperties,
          },
          required: ["breakfast", "lunch", "dinner"],
      };

    // Dynamically build schema properties based on requested days
    const schemaProperties: Record<string, any> = {};
    days.forEach(day => {
        schemaProperties[day] = dayProperties;
    });
    
    return ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: schemaProperties,
                required: days
            }
        }
    });
};

export const updateMealLogWithAI = (day: string, currentPlan: any, userLog: string) => {
    const ai = getAiInstance();
    const prompt = `
        I want to log my actual food intake for ${day}.
        
        Original Plan for ${day}: ${currentPlan ? JSON.stringify(currentPlan) : 'No plan exists for this day.'}
        
        My Actual Intake / Changes: "${userLog}"
        
        Please rewrite the entire day's log based on what I actually ate. 
        - If I skipped a meal, leave it empty or mark as skipped in description with 0 calories.
        - Estimate calories and protein for the new food items I mentioned.
        - Keep the meals I didn't mention changing as they were (unless I said I ate *nothing* else, or if there was no original plan).
        - If there was no original plan, generate the log solely based on my input.
        
        Return a JSON object for this single day containing "breakfast", "lunch", and "dinner".
    `;

    const mealProperties = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the meal." },
          description: { type: Type.STRING, description: "Brief description of the meal." },
          calories: { type: Type.INTEGER, description: "Calorie count for the meal." },
          protein: { type: Type.INTEGER, description: "Protein content in grams." },
        },
        required: ["name", "description", "calories", "protein"],
    };

    return ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    breakfast: mealProperties,
                    lunch: mealProperties,
                    dinner: mealProperties,
                },
                required: ["breakfast", "lunch", "dinner"],
            }
        }
    });
};

export const getWeeklyWorkoutPlanStream = (userInput: string) => {
    const ai = getAiInstance();
    const prompt = `
      Analyze the following user request to create a workout plan.
      The user's input is: "${userInput}".

      Based on their input, generate a JSON object representing the workout schedule.
      
      IMPORTANT Rules:
      1. If the user asks for a specific day (e.g. "Monday Chest", "Legs on Friday"), ONLY generate the key for that specific day. Do not generate the rest of the week.
      2. If the user asks for a full week plan, generate keys for "Monday" through "Sunday".
      3. For each day included, provide a workout 'name' (e.g., "Push Day", "Rest Day") and the 'content' in Markdown.
      
      Return a JSON object where keys are the Day names (e.g. "Monday", "Tuesday").
    `;

    const workoutDetailsSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "A concise name for the workout, e.g., 'Chest & Triceps' or 'Rest Day'." },
            content: { type: Type.STRING, description: "The detailed workout plan for the day in Markdown format. If it's a rest day, this can be an empty string or a simple 'Rest.' message." },
        },
        required: ["name", "content"],
    };

    return ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    "Monday": workoutDetailsSchema,
                    "Tuesday": workoutDetailsSchema,
                    "Wednesday": workoutDetailsSchema,
                    "Thursday": workoutDetailsSchema,
                    "Friday": workoutDetailsSchema,
                    "Saturday": workoutDetailsSchema,
                    "Sunday": workoutDetailsSchema,
                },
                // No required fields here to allow partial generation
            }
        }
    });
};

export const getTravelItineraryStream = (destination: string, duration: number, interests: string) => {
    const ai = getAiInstance();
    const prompt = `
      Create a travel itinerary for a ${duration}-day trip to ${destination}.
      The user is interested in: ${interests}.
      Provide a day-by-day plan.
      Return a JSON object.
    `;
    
    const activitySchema = {
        type: Type.OBJECT,
        properties: {
            time: { type: Type.STRING, description: "Time of day (e.g., Morning, 10:00 AM)" },
            activity: { type: Type.STRING, description: "Title of activity" },
            location: { type: Type.STRING, description: "Location name" },
            notes: { type: Type.STRING, description: "Details, tips, or food suggestions" },
        },
        required: ["time", "activity", "location", "notes"]
    };
    
    const daySchema = {
        type: Type.OBJECT,
        properties: {
            day: { type: Type.STRING, description: "Day X" },
            activities: { type: Type.ARRAY, items: activitySchema }
        },
        required: ["day", "activities"]
    };

    return ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    itinerary: {
                        type: Type.ARRAY,
                        items: daySchema
                    }
                },
                required: ["itinerary"]
            }
        }
    });
};

export const getShoppingListStream = (mealPlan: MealPlan) => {
    const ai = getAiInstance();
    const prompt = `
        Based on the following weekly meal plan JSON, generate a categorized shopping list. 
        Consolidate ingredients where possible and provide estimated quantities (e.g., 2 onions, 200g chicken breast).
        Format the output as simple markdown with categories as level 2 headings (e.g., ## Produce).
        
        Meal Plan:
        ${JSON.stringify(mealPlan, null, 2)}
    `;
    return ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
};

export const getProjectSummaryStream = (tasks: KanbanTask[]) => {
    const ai = getAiInstance();
    const prompt = `
      You are a project management assistant. Based on the following list of tasks in a Kanban board, provide a concise project status summary in Markdown format.

      The summary should include:
      - A brief overview of the project's current state.
      - A summary of what has been completed ('Done' column).
      - A summary of what is currently being worked on ('In Progress' column).
      - A highlight of any high-priority items in the 'Backlog' that need attention.
      - An overall sentiment or progress assessment (e.g., "on track", "making good progress", "attention needed").

      Do not just list the tasks. Synthesize the information into a readable report.

      Here is the list of tasks in JSON format:
      ${JSON.stringify(tasks, null, 2)}
    `;

    return ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
};