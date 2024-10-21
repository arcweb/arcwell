import { DimensionSchema } from "./dimension-schema";

export interface ResourceType {
  id: string;
  key: string;
  name: string;
  description?: string;
  dimensionSchemas?: DimensionSchema[];
  tags: string[];
}