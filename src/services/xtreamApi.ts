
import axios from 'axios';

export interface UserInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  exp_date: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
}

export interface XtreamAuthResponse {
  user_info: UserInfo;
  server_info: {
    url: string;
    port: string;
    https_port: string;
    server_protocol: string;
    rtmp_port: string;
    timezone: string;
    timestamp_now: number;
    time_now: string;
  };
}

export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface Stream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface Movie {
  movie_id: number;
  name: string;
  o_name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
}

export interface Series {
  series_id: number;
  name: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  release_date: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
}

export interface SeriesInfo {
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    release_date: string;
    last_modified: string;
    rating: string;
    rating_5based: number;
  };
  episodes: {
    [seasonNumber: string]: {
      id: string;
      episode_num: number;
      title: string;
      container_extension: string;
      info: {
        movie_image: string;
        plot: string;
        duration_secs: number;
        duration: string;
      };
    }[];
  };
}

export interface EPGData {
  epg_listings: {
    [channelId: string]: {
      start: string;
      end: string;
      title: string;
      description: string;
      lang: string;
      category: string;
    }[];
  };
}

export class XtreamApi {
  private baseUrl: string | null = null;
  private username: string | null = null;
  private password: string | null = null;

  constructor() {
    this.loadCredentials();
  }

  private loadCredentials() {
    this.baseUrl = sessionStorage.getItem('xtream_api_url');
    this.username = sessionStorage.getItem('xtream_api_username');
    this.password = sessionStorage.getItem('xtream_api_password');
  }

  saveCredentials(serverUrl: string, username: string, password: string) {
    this.baseUrl = serverUrl;
    this.username = username;
    this.password = password;
    sessionStorage.setItem('xtream_api_url', serverUrl);
    sessionStorage.setItem('xtream_api_username', username);
    sessionStorage.setItem('xtream_api_password', password);
  }

  clearCredentials() {
    this.baseUrl = null;
    this.username = null;
    this.password = null;
    sessionStorage.removeItem('xtream_api_url');
    sessionStorage.removeItem('xtream_api_username');
    sessionStorage.removeItem('xtream_api_password');
  }

  private getPlayerApiUrl() {
    if (!this.baseUrl || !this.username || !this.password) {
      throw new Error('API credentials not set');
    }
    // Ensure the URL has http or https prefix
    const serverUrl = this.baseUrl.startsWith('http') 
      ? this.baseUrl 
      : `http://${this.baseUrl}`;
    
    const url = new URL('/player_api.php', serverUrl);
    url.searchParams.append('username', this.username);
    url.searchParams.append('password', this.password);
    return url.toString();
  }

  async authenticate(serverUrl: string, username: string, password: string): Promise<XtreamAuthResponse> {
    // Ensure the URL has http or https prefix
    const baseUrl = serverUrl.startsWith('http') 
      ? serverUrl 
      : `http://${serverUrl}`;
    
    const url = new URL('/player_api.php', baseUrl);
    url.searchParams.append('username', username);
    url.searchParams.append('password', password);

    try {
      const response = await axios.get<XtreamAuthResponse>(url.toString());
      this.saveCredentials(baseUrl, username, password);
      return response.data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Failed to authenticate with the server');
    }
  }

  async getLiveCategories(): Promise<Category[]> {
    const url = new URL(this.getPlayerApiUrl());
    url.searchParams.append('action', 'get_live_categories');
    
    try {
      const response = await axios.get<Category[]>(url.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching live categories:', error);
      throw error;
    }
  }

  async getLiveStreams(categoryId?: string): Promise<Stream[]> {
    const url = new URL(this.getPlayerApiUrl());
    url.searchParams.append('action', 'get_live_streams');
    if (categoryId) {
      url.searchParams.append('category_id', categoryId);
    }
    
    try {
      const response = await axios.get<Stream[]>(url.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching live streams:', error);
      throw error;
    }
  }

  async getVodCategories(): Promise<Category[]> {
    const url = new URL(this.getPlayerApiUrl());
    url.searchParams.append('action', 'get_vod_categories');
    
    try {
      const response = await axios.get<Category[]>(url.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching VOD categories:', error);
      throw error;
    }
  }

  async getVodStreams(categoryId?: string): Promise<Movie[]> {
    const url = new URL(this.getPlayerApiUrl());
    url.searchParams.append('action', 'get_vod_streams');
    if (categoryId) {
      url.searchParams.append('category_id', categoryId);
    }
    
    try {
      const response = await axios.get<Movie[]>(url.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching VOD streams:', error);
      throw error;
    }
  }

  async getSeriesCategories(): Promise<Category[]> {
    const url = new URL(this.getPlayerApiUrl());
    url.searchParams.append('action', 'get_series_categories');
    
    try {
      const response = await axios.get<Category[]>(url.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching series categories:', error);
      throw error;
    }
  }

  async getSeriesList(categoryId?: string): Promise<Series[]> {
    const url = new URL(this.getPlayerApiUrl());
    url.searchParams.append('action', 'get_series');
    if (categoryId) {
      url.searchParams.append('category_id', categoryId);
    }
    
    try {
      const response = await axios.get<Series[]>(url.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching series list:', error);
      throw error;
    }
  }

  async getSeriesInfo(seriesId: number): Promise<SeriesInfo> {
    const url = new URL(this.getPlayerApiUrl());
    url.searchParams.append('action', 'get_series_info');
    url.searchParams.append('series_id', seriesId.toString());
    
    try {
      const response = await axios.get<SeriesInfo>(url.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching series info:', error);
      throw error;
    }
  }

  async getShortEPG(streamId: number, limit: number = 2): Promise<EPGData> {
    const url = new URL(this.getPlayerApiUrl());
    url.searchParams.append('action', 'get_short_epg');
    url.searchParams.append('stream_id', streamId.toString());
    url.searchParams.append('limit', limit.toString());
    
    try {
      const response = await axios.get<EPGData>(url.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching short EPG:', error);
      throw error;
    }
  }

  getLiveStreamUrl(streamId: number): string {
    if (!this.baseUrl || !this.username || !this.password) {
      throw new Error('API credentials not set');
    }
    // Ensure the URL has http or https prefix
    const serverUrl = this.baseUrl.startsWith('http') 
      ? this.baseUrl 
      : `http://${this.baseUrl}`;
    
    return `${serverUrl}/live/${this.username}/${this.password}/${streamId}.ts`;
  }

  getVodStreamUrl(streamId: number): string {
    if (!this.baseUrl || !this.username || !this.password) {
      throw new Error('API credentials not set');
    }
    // Ensure the URL has http or https prefix
    const serverUrl = this.baseUrl.startsWith('http') 
      ? this.baseUrl 
      : `http://${this.baseUrl}`;
    
    return `${serverUrl}/movie/${this.username}/${this.password}/${streamId}.mp4`;
  }

  getSeriesStreamUrl(seriesId: number, episodeId: string): string {
    if (!this.baseUrl || !this.username || !this.password) {
      throw new Error('API credentials not set');
    }
    // Ensure the URL has http or https prefix
    const serverUrl = this.baseUrl.startsWith('http') 
      ? this.baseUrl 
      : `http://${this.baseUrl}`;
    
    return `${serverUrl}/series/${this.username}/${this.password}/${episodeId}.mp4`;
  }
}

export default new XtreamApi();
