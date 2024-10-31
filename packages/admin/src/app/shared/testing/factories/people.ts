export const peopleFactory = (amount: number) => {
  const peopleList = [];
  for (let i = 0; i < amount; i++) {
    peopleList.push({
      id: i.toString(),
      familyName: `Doe-${i}`,
      givenName: `John-${i}`,
      typeKey: 'student',
      dimensions: [],
      tags: [],
      user: undefined,
      personType: {
        key: 'student',
        name: 'Student',
        description: 'A student',
      },
      cohorts: [],
      cohortsCount: 0,
    });
  }
  return peopleList;
};
