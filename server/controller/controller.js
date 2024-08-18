const { PartnershipDeed } = require('../models/model');

async function createPartnershipDeed(req, res) {
    try {
        const { date, firmName, numberOfPartners, partners, businessActivity, businessAddress, numberOfSignatories, signatories } = req.body;

        const newPartnershipDeed = new PartnershipDeed({
            date,
            firmName,
            numberOfPartners,
            partners,
            businessActivity,
            businessAddress,
            numberOfSignatories,
            signatories
        });

        await newPartnershipDeed.save();

        res.status(201).json({ message: "Partnership deed saved successfully" });
    } catch (error) {
        console.error("Error saving partnership deed:", error);
        res.status(500).json({ message: "Failed to save partnership deed", error: error.message });
    }
}

async function searchPartnershipDeeds(req, res) {
    try {
        const { q } = req.query;

        let results;

        if (q) {
            // If query is provided, perform a search with the query
            results = await PartnershipDeed.find({
                firmName: { $regex: q, $options: 'i' }  // Case-insensitive search
            });
        } else {
            // If no query is provided, return all records
            results = await PartnershipDeed.find({});
        }

        res.status(200).json(results);
    } catch (error) {
        console.error("Error searching for partnership deeds:", error);
        res.status(500).json({ message: "Failed to search partnership deeds", error: error.message });
    }
}
//id
async function getPartnershipDeedById(req, res) {
    try {
        const { id } = req.params;
        console.log('Request ID:', id);
        const partnershipDeed = await PartnershipDeed.findById(id);
        console.log('Found Partnership Deed:', partnershipDeed);
        if (!partnershipDeed) {
            return res.status(404).json({ message: "Partnership deed not found" });
        }

        res.status(200).json(partnershipDeed);
    } catch (error) {
        console.error("Error retrieving partnership deed:", error);
        res.status(500).json({ message: "Failed to retrieve partnership deed", error: error.message });
    }
}
module.exports = {
    createPartnershipDeed,
    searchPartnershipDeeds,
    getPartnershipDeedById
};
