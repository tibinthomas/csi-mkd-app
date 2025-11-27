import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiKey = 'AIzaSyDwvRBjbQlyIzz8rj4n4lreWhq3xR9RNgE'; // Will be set via environment variable
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  private readonly systemContext = `You are a helpful assistant for CSI Counselling Centre, Madhya Kerala Diocese located at CMS Press Compound, Kottayam-1.

SERVICES OFFERED:
1. Individual Counselling - Personal & online sessions for stress, anxiety, grief, and related challenges
2. Couple & Family Therapy - Resolve conflicts and strengthen family relationships with professional guidance
3. Child & Adolescent Therapy - Support for behavioral, academic, emotional development, and career guidance
4. Psychodiagnostics - Assessments for learning difficulties, psychological testing, and career planning
5. Premarital Counselling - Three-day residential program (Thursday 9:30am to Saturday 11:00am) to prepare couples for marriage
6. Pre-confirmational Counselling - Half/one day programme to guide youth preparing for confirmation
7. School & College Outreach - SHAPE (Students' Holistic and Pragmatic Empowerment) program

KEY INFORMATION:
- Current Director: Rev. Robin Mathew John (May 2025 - Present)
- Location: Diocese of Madhya Kerala, CMS Press Compound, Kottayam-1
- Premarital counselling requires registration through the website
- Three-day premarital camp held first Thursday to Saturday every month at CSI Retreat Centre Kottayam
- The centre offers faith-sensitive, confidential counselling
- Both in-person and online appointments available
- SHAPE program offers holistic wellbeing through counselling in schools

REGISTRATION PROCESS:
- Each partner must complete their own separate registration form
- Required information: personal details, church membership, partner information, contact details
- Must upload photo and accept informed consent
- Sessions are assigned based on availability

Be friendly, concise, and professional. If asked about something not in this context, politely say you're specifically focused on CSI Counselling Centre information and suggest contacting them directly.`;

  constructor(private http: HttpClient) {}

  async sendMessage(userMessage: string, history: Message[]): Promise<string> {
    // Build conversation context
    const conversationHistory = history
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${this.systemContext}

Previous conversation:
${conversationHistory}

User: ${userMessage}
Assistant:`;

    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });

      const body = {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      const url = `${this.apiUrl}?key=${this.apiKey}`;
      const response: any = await firstValueFrom(
        this.http.post(url, body, { headers })
      );

      if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text;
      }

      throw new Error('Invalid API response');
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to get response from AI assistant');
    }
  }
}
