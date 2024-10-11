import { DimensionSchema } from "./dimension-schema";

export interface FactType {
  id: string;
  createdAt: string;
  updatedAt: string;
  key: string;
  name: string;
  description?: string;
  tags: string[];
  dimensionSchemas: DimensionSchema[];
}
