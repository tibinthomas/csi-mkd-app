import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SessionDataService } from '../core/services/session-data.service';
import { CreateUpdateSessionDto } from '../../api/api-main-app/models/create-update-session-dto';

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
- Location: CSI Counselling Centre, CMS Press Compound, Chalukunnu, Kottayam-1, Kerala, India – 686001
- Contact Numbers: +91-8129778832, +91-9946033731
- Email: csimkdmarry@gmail.com
- Working Hours: Mon – Sat | 9:00 AM – 6:00 PM
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

  constructor(
    private http: HttpClient,
    private sessionDataService: SessionDataService
  ) {}

  async sendMessage(userMessage: string, history: Message[]): Promise<string> {
    // Fetch upcoming sessions
    let sessionContext = '';
    // Check if the user message contains keywords related to sessions
    const includeSession = this.shouldIncludeSessionContext(userMessage);
    console.log('Should include session context:', includeSession);

    if (includeSession) {
      try {
        console.log('Fetching sessions...');
        const sessions = await firstValueFrom(this.sessionDataService.fetchSessions()) as CreateUpdateSessionDto[];
        console.log('Sessions fetched:', sessions);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingSessions = sessions
          .filter((s: CreateUpdateSessionDto) => s.startDate && new Date(s.startDate) >= today)
          .sort((a: CreateUpdateSessionDto, b: CreateUpdateSessionDto) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
          .slice(0, 3); // Get top 3 upcoming sessions
        
        console.log('Upcoming sessions:', upcomingSessions);

        if (upcomingSessions.length > 0) {
          sessionContext = '\n\nUPCOMING SESSIONS:\n' + upcomingSessions.map((s: CreateUpdateSessionDto) => 
            `- ${s.sessionName}: ${new Date(s.startDate!).toLocaleDateString()} to ${new Date(s.endDate!).toLocaleDateString()}`
          ).join('\n');
        } else {
          sessionContext = '\n\nUPCOMING SESSIONS:\nNo upcoming sessions scheduled at the moment.';
        }
      } catch (error) {
        console.error('Failed to fetch sessions for chatbot:', error);
      }
    }

    // Build conversation context
    const conversationHistory = history
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${this.systemContext}${sessionContext}

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

  private shouldIncludeSessionContext(message: string): boolean {
    const keywords = [
      'session', 'class', 'date', 'schedule', 'upcoming', 'when', 
      'register', 'premarital', 'camp', 'time', 'available', 'next'
    ];
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
  }
}
