export type Review = {
  id: string;
  user_id: string;
  spot_id: string;
  rating: number;
  text: string;
  created_at: string;
  user?: { username: string; full_name: string };
};

export type Spot = {
  id: string;
  name: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  total_reviews: number;
  price_level: string;
  tags: string[];
  image: string;
  photos: string[];
  atmosphere: string;
  crowd_level: string;
  hours: string;
  wifi_strength: string;
  noise_level: string;
  outlets: string;
  seating: string;
  added_by: string;
  reviews?: Review[];
};

export type UserProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  points: number;
  spots_added: number;
  reviews_written: number;
};

export type SavedSpot = {
  id: string;
  user_id: string;
  spot_id: string;
  spot?: Spot;
};
