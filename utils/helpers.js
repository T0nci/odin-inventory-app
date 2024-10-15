const formatRelations = (relationRows) => {
  const arrays = {
    genres: [],
    platforms: [],
    developers: [],
  };

  for (const relation of relationRows) {
    arrays[relation.type + "s"].push({
      category: relation.category,
      id: relation.id,
    });
  }

  return arrays;
};

const limitStringLength = (string) => {
  if (string.length > 30) {
    return string.slice(0, 27) + "...";
  }

  return string;
};

module.exports = {
  formatRelations,
  limitStringLength,
};
