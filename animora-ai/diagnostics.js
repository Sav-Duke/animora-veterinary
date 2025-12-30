function suggestDiagnosis(symptoms) {
  const db = require('./disease-database.json');
  let matches = db.filter(d =>
    symptoms.some(s => d.symptoms.includes(s))
  );
  return matches.map(d => ({
    name: d.name,
    treatment: d.treatment
  }));
}
// Usage: suggestDiagnosis(["vomiting","lethargy"])
