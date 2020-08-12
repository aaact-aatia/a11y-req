const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PresetSchema = new Schema({
  name: { type: String, required: true },
  frName: { type: String },
  description: { type: String },
  frDescription: { type: String },
  clauses: [{ type: Schema.Types.ObjectId, ref: 'Clause' }],
  order: { type: Number },
  onlyIf: { type: Boolean }
});

PresetSchema.virtual('url').get(function () {
  return '/edit/preset/' + this._id;
});

module.exports = mongoose.model('Preset', PresetSchema);