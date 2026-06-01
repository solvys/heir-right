import type { HermesActionRequest, HermesActionResponse, HermesConnection } from "./types.js";

export class HermesClient {
  constructor(
    private readonly connection: HermesConnection,
    private readonly authToken?: string
  ) {}

  get mode() {
    return this.connection.mode;
  }

  get baseUrl() {
    return this.connection.baseUrl;
  }

  async execute(request: HermesActionRequest): Promise<HermesActionResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`${this.connection.baseUrl}/v1/actions/execute`, {
        method: "POST",
        headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const text = await response.text();
        return { ok: false, error: text || `Hermes request failed (${response.status})` };
      }

      const result = (await response.json()) as unknown;
      return { ok: true, result };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Hermes error";
      return { ok: false, error: message };
    }
  }

  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.connection.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export function createHermesClient(connection: HermesConnection, authToken?: string): HermesClient {
  return new HermesClient(connection, authToken);
}
