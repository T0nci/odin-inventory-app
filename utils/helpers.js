const formatRelations = (relationRows) => {
  const arrays = {
    genres: [],
    platforms: [],
    developers: [],
  };

  for (const relation of relationRows) {
    arrays[relation.type + "s"].push(relation.category);
  }

  return arrays;
};

module.exports = {
  formatRelations,
};
