import { getUserId } from "../auth/auth";
import { V5_API_URL } from "../env";

export type TaskV5 = {
  id: string;
  title: string;
  status: "todo" | "done";
  ownerId: string;
};

const baseUrl = V5_API_URL.replace(/\/$/, "");

const withAuthHeaders = () => {
  const userId = getUserId();
  if (!userId) {
    throw new Error("User ID manquant.");
  }
  return {
    "x-user-id": userId,
  };
};

export const getTasks = async (): Promise<TaskV5[]> => {
  try {
    const response = await fetch(`${baseUrl}/v5/tasks`, {
      headers: withAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`GET /v5/tasks failed (${response.status})`);
    }
    return response.json() as Promise<TaskV5[]>;
  } catch (error) {
    console.error("[V5] getTasks failed", error);
    throw error;
  }
};

export const createTask = async (title: string): Promise<TaskV5> => {
  try {
    const response = await fetch(`${baseUrl}/v5/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...withAuthHeaders(),
      },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) {
      throw new Error(`POST /v5/tasks failed (${response.status})`);
    }
    return response.json() as Promise<TaskV5>;
  } catch (error) {
    console.error("[V5] createTask failed", error);
    throw error;
  }
};
