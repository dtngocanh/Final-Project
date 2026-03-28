import Address from "../models/Address.js";

export const addAddress = async (req, res) => {
    try {
        const { userId, firstName, lastName, email, street, city, zipcode, country, phone } = req.body;

        if (!userId || !firstName || !lastName || !email || !street || !city || !zipcode || !country || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const newAddress = new Address({
            userId,
            firstName,
            lastName,
            email,
            street,
            city,
            zipcode,
            country,
            phone
        });

        await newAddress.save();

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            address: newAddress
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserAddress = async (req, res) => {
    try {
        const userId = req.body; 

        const addresses = await Address.find({ userId });

        res.status(200).json({
            success: true,
            addresses
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};