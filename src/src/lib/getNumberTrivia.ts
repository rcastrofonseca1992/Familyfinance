import { projectId, publicAnonKey } from '../../utils/supabase/info';

// NOTE: The make-server function name must match the deployed Edge Function name
// Check: Supabase Dashboard → Edge Functions → Verify the exact name
// Current: make-server-d9780f4d
const NUMBERFACT_API = `https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/numberfact`;

async function fetchNumberFact(type: string, number: string | number): Promise<string> {
  try {
    const url = `${NUMBERFACT_API}?type=${type}&number=${number}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'apikey': publicAnonKey,
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API error (${res.status}):`, errorText);
      throw new Error(`API returned status: ${res.status}`);
    }
    
    const data = await res.json();
    return data.text || data.error || "Fun fact: Numbers are fascinating!";
  } catch (error) {
    console.error(`Error fetching ${type} fact:`, error);
    return "Fun fact: even APIs get tired sometimes!";
  }
}

export async function getNumberTrivia(num: number | "random"): Promise<string> {
  return fetchNumberFact("trivia", num);
}

export async function getNumberMath(num: number | "random"): Promise<string> {
  return fetchNumberFact("math", num);
}

export async function getYearFact(year?: number): Promise<string> {
  const yearToUse = year || (1900 + Math.floor(Math.random() * 124));
  return fetchNumberFact("year", yearToUse);
}

export async function getDateFact(month?: number, day?: number): Promise<string> {
  const m = month || (Math.floor(Math.random() * 12) + 1);
  const d = day || (Math.floor(Math.random() * 28) + 1);
  return fetchNumberFact("date", `${m}/${d}`);
}

// Get a random fact from any category
export async function getRandomFact(): Promise<string> {
  const factTypes = [
    () => getNumberTrivia("random"),
    () => getNumberMath("random"),
    () => getYearFact(),
    () => getDateFact(),
  ];

  const randomType = factTypes[Math.floor(Math.random() * factTypes.length)];
  return randomType();
}
