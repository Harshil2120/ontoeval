import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;
  await connectMongoDB();
  const ans = await User.findOne({ email: id });
  const topic = ans.questions;
  return NextResponse.json({ topic }, { status: 200 });
}

export async function PATCH(req, { params }) {
  const { id } = params;
  const requestBody = await req.json();
  const { questionSerial, annotate, answered, edited } = requestBody;
  console.log("updated data", annotate);
  console.log("serial number", questionSerial);

  if (!annotate) {
    return NextResponse.json(
      { error: "No update data provided" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB(); // Connect to your MongoDB database.

    const existingUser = await User.findOne({ email: id });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const questionIndex = existingUser.questions.findIndex(
      (question) => question.serial === questionSerial
    );

    if (questionIndex === -1) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Update the specific question
    existingUser.questions[questionIndex].annotate = annotate;
    existingUser.questions[questionIndex].answered = answered;
    existingUser.questions[questionIndex].edited = edited;

    // Save the updated user document
    await existingUser.save();

    return NextResponse.json({ message: "Question updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
