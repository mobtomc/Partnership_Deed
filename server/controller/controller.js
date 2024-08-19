const { PartnershipDeed } = require('../models/model');

// Helper function to check if firm exists
async function firmExists(firmName) {
    const firm = await PartnershipDeed.findOne({ firmName });
    return firm !== null;
}

async function createOrUpdatePartnershipDeed(req, res) {
    try {
        const { date, firmName, numberOfPartners, partners, businessActivity, businessAddress, numberOfSignatories, signatories } = req.body;

        const exists = await firmExists(firmName);

        if (exists) {
            // Update existing firm
            const updatedPartnershipDeed = await PartnershipDeed.findOneAndUpdate(
                { firmName },
                {
                    date,
                    numberOfPartners,
                    partners,
                    businessActivity,
                    businessAddress,
                    numberOfSignatories,
                    signatories
                },
                { new: true } // Return the updated document
            );
            return res.status(200).json({ message: "Partnership deed updated successfully", data: updatedPartnershipDeed });
        } else {
            // Create new firm
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
            return res.status(201).json({ message: "Partnership deed saved successfully" });
        }
    } catch (error) {
        console.error("Error saving or updating partnership deed:", error);
        res.status(500).json({ message: "Failed to save or update partnership deed", error: error.message });
    }
}

// Other functions remain unchanged
async function searchPartnershipDeeds(req, res) {
    try {
        const { q } = req.query;
        let results;

        if (q) {
            results = await PartnershipDeed.find({
                firmName: { $regex: q, $options: 'i' }  // Case-insensitive search
            });
        } else {
            results = await PartnershipDeed.find({});
        }

        res.status(200).json(results);
    } catch (error) {
        console.error("Error searching for partnership deeds:", error);
        res.status(500).json({ message: "Failed to search partnership deeds", error: error.message });
    }
}

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
    createOrUpdatePartnershipDeed,
    searchPartnershipDeeds,
    getPartnershipDeedById
};
