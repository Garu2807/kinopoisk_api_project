"use strict";
import { type Movie } from "./types/Movie";

const apiKey = import.meta.env.VITE_API_KEY;
const baseUrl = "/api";

if (!apiKey) {
  throw new Error("API key is missing");
}

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("API returned non-JSON response");
  }

  return response.json();
};

export const getMovies = async (page = 1): Promise<Movie[]> => {
  const response = await fetch(
    `${baseUrl}/v1.4/movie?page=${page}&limit=50&lists=top250`,
    {
      headers: {
        "X-API-KEY": apiKey,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.status}`);
  }
  const data = await parseJsonResponse(response);
  return data.docs ?? [];
};

export const getMovieById = async (id: number): Promise<Movie | null> => {
  const response = await fetch(`${baseUrl}/v1.4/movie/${id}`, {
    headers: {
      "X-API-KEY": apiKey,
    },
  });
  if (!response.ok) {
    return null;
  }
  const data = await parseJsonResponse(response);
  return data;
};
