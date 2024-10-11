import { Dimension } from "./dimension";

export interface Fact {
  id?: string;
  typeKey: string;
  personId?: string;
  resourceId?: string;
  eventId?: string;
  observedAt: string;
  info?: object;
  dimensions: Dimension[];
}
