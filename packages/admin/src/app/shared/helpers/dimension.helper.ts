import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
import { DimensionType } from '@schemas/dimension.schema';

interface HasDimensions {
  dimensions: DimensionType[];
}

export function convertDimensionDataTypeValues<
  T extends HasDimensions,
  K extends keyof T,
>(obj: T, typeFieldName: K): T {
  const typeField = obj[typeFieldName];

  if (
    !typeField ||
    typeof typeField !== 'object' ||
    !('dimensionSchemas' in typeField)
  ) {
    throw new Error(
      `The provided type field '${String(
        typeFieldName,
      )}' does not contain dimensionSchemas`,
    );
  }

  const { dimensionSchemas } = typeField as {
    dimensionSchemas: DimensionSchemaType[];
  };

  // Create a map of dimension keys to their data types
  const dataTypeMap = new Map<string, string>(
    dimensionSchemas.map((schema: DimensionSchemaType) => [
      schema.key,
      schema.dataType,
    ]),
  );

  // Convert dimension values based on their data type
  obj.dimensions.forEach((dimension: DimensionType) => {
    const dataType = dataTypeMap.get(dimension.key);
    if (dataType === 'number') {
      const num = Number(dimension.value);
      if (!isNaN(num)) {
        dimension.value = num;
      } else {
        console.warn(
          `Invalid number for dimension ${dimension.key}: ${dimension.value}`,
        );
      }
    }
    // Add more data types as needed (e.g., 'boolean', 'date', etc.)
  });

  return obj;
}

// import { FactType } from '@schemas/fact.schema';
// import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
// import { DimensionType } from '@schemas/dimension.schema';
//
// export function convertDimensionDataTypeValues(obj: FactType): FactType {
//   const { dimensionSchemas } = obj.factType;
//   const { dimensions } = obj;
//
//   // Create a map of dimension keys to their data types
//   const dataTypeMap = new Map<string, string>(
//     dimensionSchemas.map((schema: DimensionSchemaType) => [
//       schema.key,
//       schema.dataType,
//     ]),
//   );
//
//   // Convert dimension values based on their data type
//   dimensions.forEach((dimension: DimensionType) => {
//     const dataType = dataTypeMap.get(dimension.key);
//     if (dataType === 'number') {
//       const num = Number(dimension.value);
//       if (!isNaN(num)) {
//         dimension.value = num;
//       } else {
//         console.warn(
//           `Invalid number for dimension ${dimension.key}: ${dimension.value}`,
//         );
//       }
//     }
//   });
//
//   return obj;
// }
