import { Dimension } from "./dimension";

export interface Fact {
  id?: string;
  typeKey: string;
  personId?: string;
  resourceId?: string;
  eventId?: string;
  // createdAt?: string;
  // updatedAt?: string;
  observed_at: string;
  info?: object;
  dimensions: Dimension[];
}
