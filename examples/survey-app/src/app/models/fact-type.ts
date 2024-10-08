import { DimensionSchema } from "./dimension-schema";
import { Tag } from "./tag";

export interface FactType {
  id: string;
  createdAt: string;
  updatedAt: string;
  key: string;
  name: string;
  description?: string;
  tags: Tag[];
  dimensionSchemas: DimensionSchema[];
}
