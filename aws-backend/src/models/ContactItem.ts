export interface ContactItem {
  userId: string;
  contactUserId: string;
  contactEmail: string;
  createdAt: string;
}

export interface ContactItemOnline extends ContactItem {
  online?: boolean;
}
