import mongoose from 'mongoose';

const codeValidationSchema = new mongoose.Schema({
  file: { type: String, required: true },
  result: { type: String, required: true },
  errors: { type: [String], default: [] },
  warnings: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const CodeValidation = mongoose.model('CodeValidation', codeValidationSchema);
export default CodeValidation;
