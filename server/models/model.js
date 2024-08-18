const mongoose = require('mongoose');

const partnershipDeedSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    firmName: { type: String, required: true },
    numberOfPartners: { type: Number, required: true },
    partners: [
        {
            name: { type: String, required: true },
            sonOf: { type: String },  // Update this if needed
            aadharNo: { type: String },
            capital: { type: Number },  // Ensure this matches the form field
            profitShare: { type: Number },  // Ensure this matches the form field
            salary: { type: Number },
            address: { type: String }  // Update this if needed
        }
    ],
    businessActivity: { type: String, required: true },  // Update this if needed
    businessAddress: { type: String, required: true },
    numberOfSignatories: { type: Number, required: true },
    signatories: [String]
});

const PartnershipDeed = mongoose.model('PartnershipDeed', partnershipDeedSchema);

module.exports = {
    PartnershipDeed
};


