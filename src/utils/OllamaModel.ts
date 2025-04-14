export class OllamaModel {
  private model: string;

  private config: any;

  constructor(model: string, server: string, port: number, name: string) {
    this.model = model;
    this.config = {};
  }

  public async generate(
    prompt: string,
    options: any = {},
    callback: (response: string) => void
  ) {
    // Simulate a response from the model
    fetch(`http://localhost:${this.config.port}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        options: options,
      }),
    }).then((response) => response.json());
  }

  getModel() {
    return this.model;
  }
}
