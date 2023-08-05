export interface User {
  email: string;
  password: string;
}

export interface Token {
  token: string;
}

export interface ErrorStr {
  message: string;
}

export interface ICreateShortLink {
  originalLink: string;
  expirationTime: "one-time" | "1 day" | "3 days" | "7 days";
}

export interface Link {
  link: string;
}

export interface UserLink {
  id: string;
  ownerEmail: string;
  originalLink: string;
  expirationTime: string;
  visitCount: number;
}
export interface UserLinkArray {
  links: UserLink[];
}
