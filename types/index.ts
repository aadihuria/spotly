export interface UserStats {
  spotsVisited: number;
  reviewsWritten: number;
  groupsJoined: number;
  spotsAdded: number;
}

export interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  university: string;
  major?: string;
  graduationYear?: number;
  interests: string[];
  stats: UserStats;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface Hours {
  [day: string]: { open: string; close: string; closed?: boolean };
}

export interface SpotImage {
  id: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  caption?: string;
}

export interface StudySpot {
  id: string;
  name: string;
  description: string;
  location: Location;
  images: SpotImage[];
  uploadedBy: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  features: string[];
  amenities: string[];
  hours: Hours;
  price: 'Free' | '$' | '$$' | '$$$';
  status: 'Open' | 'Closed';
  currentOccupancy: 'Light' | 'Moderate' | 'Busy' | 'Full';
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingSchedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  recurrence: 'weekly' | 'biweekly' | 'custom';
}

export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  groupId?: string;
  content: string;
  type: 'text' | 'image' | 'system';
  imageUrl?: string;
  replyTo?: string;
  reactions: Reaction[];
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: Record<string, number>;
  updatedAt: Date;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  type: 'course' | 'interest' | 'major';
  course?: string;
  subject?: string;
  interests?: string[];
  avatar?: string;
  coverImage?: string;
  meetingSchedule: MeetingSchedule[];
  location?: string;
  spotId?: string;
  members: GroupMember[];
  maxMembers: number;
  privacy: 'public' | 'private';
  joinApproval: 'auto' | 'manual';
  createdBy: string;
  admins: string[];
  pinnedMessages: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  spotId: string;
  rating: number;
  text: string;
  images: string[];
  helpful: number;
  helpfulBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'message' | 'group' | 'review' | 'system';
  readAt?: Date;
  createdAt: Date;
}

// Backwards-compatible aliases used by pre-existing pages/components.
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
};
