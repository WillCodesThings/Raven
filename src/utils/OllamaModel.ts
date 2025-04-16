interface Message {
  role: string;
  message: string;
}

export class OllamaModel {
  private model: string;

  private config: any;

  private messages: Message[];

  constructor(model: string, server: string, port: number, name: string, route: string = "/generate", method: string = "POST") {
    this.model = model;
    this.config = {
      server,
      port,
      name,
      route,
      method
    };
    this.messages = [];
  }

  public addMessage(message: Message) {
    this.messages.push(message);
  }

  public getMessages() {
    return this.messages;
  }


  public async generate(
    prompt: string,
    options: any = {},
    callback: (response: string) => void
  ) {
    this.addMessage({
      role: "user",
      message: prompt,
    });

    // Simulate a response from the model
    fetch(`http://${this.config.server}:${this.config.port}${this.config.route}`, {
      method: this.config.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({messages: this.messages }),
    }).then((response) => response.json());
  }

  getModel() {
    return this.model;
  }
}
