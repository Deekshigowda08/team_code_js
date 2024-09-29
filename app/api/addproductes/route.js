import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connect } from "./address"; // Ensure this imports your MongoDB connection string
import { Userid } from "./find_address"; // Ensure this imports your User model

export async function POST(req) {
  try {
    // Parse the request payload
    const payload = await req.json();
    const { email, value } = payload;

    // Ensure Mongoose connection
    await mongoose.connect(connect, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Validate the required fields
    if (!email || !value) {
      throw new Error("Missing email or value in the request.");
    }

    // Ensure value is an array
    const valuesToAdd = Array.isArray(value) ? value : [value];

    // Update the user document based on the email and push the new values into the array
    const user = await Userid.findOneAndUpdate(
      { email: email }, // Find the user by email
      { $push: { value: { $each: valuesToAdd } } }, // Use $push with $each to append multiple items to the value array
      { new: true, upsert: true } // Return the updated document and create if not found
    );

    // If user was not found or update failed, handle it here
    if (!user) {
      throw new Error("User not found or update failed.");
    }

    // Return success response
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error during the update process:", error.message);
    return NextResponse.json({ success: false, error: error.message });
  } finally {
    // Optional: Close the connection if needed
    await mongoose.connection.close();
  }
}