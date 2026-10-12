const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', CounterSchema);

const getNextVoucherNumber = async () => {
  const year = new Date().getFullYear();
  const counterId = `voucher_${year}`;

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSequence = String(counter.seq).padStart(4, '0');
  return `EV-${year}-${paddedSequence}`;
};

module.exports = { Counter, getNextVoucherNumber };
