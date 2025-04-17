export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelConfig {
  systemPrompt: string;
  server: string;
  port: number;
  name: string;
  route: string;
  method: 'POST' | 'GET'; // Could be extended if needed
}

export class AIModel {
  private model: string;
  private config: ModelConfig;
  private messages: Message[];

  constructor(model: string, config: ModelConfig) {
    this.model = model;
    this.config = config;
    this.messages = [
      {
        role: 'system',
        content: this.config.systemPrompt,
      },
    ];
  }

  public getPrompt(): string {
    return this.messages[0].content
  }

  public setSystemPrompt(prompt: string) {
    this.messages= [
      {
        role: "system",
        content: prompt
      }
    ];
  }

  public addMessage(message: Message): void {
    this.messages.push(message);
  }

  public getMessages(): Message[] {
    return this.messages;
  }

  public async applyCorrection(correction: string): Promise<void> {
    this.addMessage({ role: 'system', content: correction });
    await this.sendRequest();
  }

  public async generate(
    prompt: string,
    options: any = {},
    callback: (response: string) => void
  ): Promise<string> {
    this.addMessage({ role: 'user', content: prompt });
    return await this.sendRequest(options).then((reply) => {
      // const reply = res; // Adjust based on actual API response format
      if (!reply) return "Idk it returned 500 (reply doesn't exist)"; 
      callback(reply.response);
      return reply.response;
    });
    
  }

  public getModel(): string {
    return this.model;
  }

  private async sendRequest(extraData: object = {}): Promise<any> {
    const url = `http://${this.config.server}:${this.config.port}${this.config.route}`;
    console.log("[URL]", url);
    const payload = {
      messages: this.messages,
      ...extraData,
    };

    try {
      const response = await fetch(url, {
        method: this.config.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending request to model:', error);
      return null;
    }
  }
}
