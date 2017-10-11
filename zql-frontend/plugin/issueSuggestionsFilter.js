const issueSuggestionsFilter = (searchValue, issues) => {
  const lowerSearch = searchValue.toLowerCase();
  return issues.filter(i => i.replace(/\s+/g, '')
               .toLowerCase().indexOf(lowerSearch) !== -1).take(5);
};

export default issueSuggestionsFilter;
