const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClauseSchema = new Schema({
  number: { type: String, required: true }, // Order and parent/child relationships are determined by number
  name: { type: String, required: true },
  frName: { type: String, required: true },
  informative: { type: Boolean, required: true }, // Informative clauses must be included whenever a parent clause is included
  description: { type: String },
  frDescription: { type: String },
  compliance: { type: String },
  frCompliance: { type: String }
});

ClauseSchema.virtual('url').get(function () {
  return '/edit/clause/' + this._id;
});

module.exports = mongoose.model('Clause', ClauseSchema);