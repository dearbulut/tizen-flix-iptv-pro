
import axios from 'axios';

const API_KEY = '42125c682636b68d10d70b487c692685';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjEyNWM2ODI2MzZiNjhkMTBkNzBiNDg3YzY5MjY4NSIsIm5iZiI6MS42NDM4MjA2NjA2OTUwMDAyZSs5LCJzdWIiOiI2MWZhYjY3NGI3YWJiNTAwNjY1YWQ4MzAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.e06dzH5trScMiz7obFbCFip5dO1XQp-bUC3lecJ8sxU';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface MovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genres: { id: number; name: string }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
}

export interface TVDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  number_of_seasons: number;
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  seasons: {
    id: number;
    name: string;
    overview: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
  }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
}

export interface SearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`
  }
});

export class TMDBApi {
  async searchMulti(query: string, language: string = 'tr-TR'): Promise<SearchResult[]> {
    try {
      const response = await apiInstance.get('/search/multi', {
        params: {
          query,
          language,
          page: 1,
          include_adult: false,
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error searching TMDB:', error);
      throw error;
    }
  }

  async getMovieDetails(id: number, language: string = 'tr-TR'): Promise<MovieDetails> {
    try {
      const response = await apiInstance.get(`/movie/${id}`, {
        params: {
          language,
          append_to_response: 'credits,videos'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie details for ID ${id}:`, error);
      throw error;
    }
  }

  async getTVDetails(id: number, language: string = 'tr-TR'): Promise<TVDetails> {
    try {
      const response = await apiInstance.get(`/tv/${id}`, {
        params: {
          language,
          append_to_response: 'credits,videos'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching TV details for ID ${id}:`, error);
      throw error;
    }
  }

  getPosterUrl(path: string | null, size: string = 'w500'): string | null {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  getBackdropUrl(path: string | null, size: string = 'original'): string | null {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  getProfileUrl(path: string | null, size: string = 'w185'): string | null {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }
}

export default new TMDBApi();
