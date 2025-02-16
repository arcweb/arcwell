import { FeatureFilterOperator } from '../interfaces/feature-filter';

const fullOperatorList: FeatureFilterOperator[] = [
  { name: 'eq', label: 'Equals' },
  { name: 'ne', label: "Doesn't Equal" },
  { name: 'gt', label: 'Greater Than' },
  { name: 'lt', label: 'Less Than' },
  { name: 'gte', label: 'Greater Than or Equals' },
  { name: 'lte', label: 'Less Than or Equals' },
];

export const operatorsForTypes: Record<string, FeatureFilterOperator[]> = {
  string: fullOperatorList.filter(op => op.name === 'eq' || op.name === 'ne'),
  number: fullOperatorList,
  datetime: fullOperatorList,
};
