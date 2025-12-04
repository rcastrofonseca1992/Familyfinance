import { projectId, publicAnonKey } from "../../utils/supabase/info";

const PROJECT_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/funfact`;

interface FunFactResponse {
  lang: string;
  source: string;
  fact: string;
}

export async function getFunFact(language: string = "en"): Promise<FunFactResponse> {
  try {
    const res = await fetch(
      `${PROJECT_URL}?lang=${language}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error fetching fun fact:", errorText);
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    
    if (data.error) {
      console.error("Fun fact API error:", data);
      throw new Error(data.message || "Unknown error");
    }

    return data;
  } catch (err) {
    console.error("Failed to fetch fun fact:", err);
    throw err;
  }
}
