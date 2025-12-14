// backend/models/diseaseModel.js
import mongoose from "mongoose";

const diseaseSchema = new mongoose.Schema({
  name: String,
  species: [String],

  clinical_diagnosis_and_findings: [
    {
      category: String,
      findings: [String]
    }
  ],

  diagnostic_tests: [
    {
      test: String,
      type: String,
      expected_finding: String
    }
  ],

  treatment: [
    {
      modality: String,
      details: [String],
      types: [
        {
          type: String,
          use: String,
          relevant_antibiotics: [String],
          adjunct: String
        }
      ]
    }
  ],

  category: String,
  prevalence_regions: [String]
});

export default mongoose.model("Disease", diseaseSchema);


