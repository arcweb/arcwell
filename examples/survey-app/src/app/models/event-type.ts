import { DimensionSchema } from "./dimension-schema";

export interface EventType {
  id: string;
  key: string;
  name: string;
  description?: string;
  tags: string[];
  dimensionSchemas?: DimensionSchema[];
}