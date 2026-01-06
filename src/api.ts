import axios, { AxiosError, AxiosInstance } from "axios";
import { HetznerAPIError } from "./types.js";

const API_BASE_URL = "https://api.hetzner.cloud/v1";

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    const token = process.env.HETZNER_API_TOKEN;
    if (!token) {
      throw new Error("HETZNER_API_TOKEN environment variable is required");
    }

    apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
  }
  return apiClient;
}

export async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: unknown,
  params?: Record<string, unknown>
): Promise<T> {
  const client = getApiClient();
  const response = await client.request<T>({
    url: endpoint,
    method,
    data,
    params
  });
  return response.data;
}

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as HetznerAPIError | undefined;
      const hetznerError = data?.error;

      switch (status) {
        case 401:
          return "Error: Authentication failed. Please check your HETZNER_API_TOKEN.";
        case 403:
          return `Error: Permission denied. ${hetznerError?.message || "You don't have access to this resource."}`;
        case 404:
          return `Error: Resource not found. ${hetznerError?.message || "Please check the ID is correct."}`;
        case 409:
          return `Error: Conflict. ${hetznerError?.message || "The resource is in a conflicting state."}`;
        case 422:
          return `Error: Invalid request. ${hetznerError?.message || "Please check your parameters."}`;
        case 429:
          return "Error: Rate limit exceeded. Please wait a moment before making more requests.";
        case 503:
          return "Error: Hetzner API is temporarily unavailable. Please try again later.";
        default:
          return `Error: API request failed (${status}). ${hetznerError?.message || error.message}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again.";
    } else if (error.code === "ENOTFOUND") {
      return "Error: Could not connect to Hetzner API. Please check your internet connection.";
    }
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return "Error: An unexpected error occurred.";
}
