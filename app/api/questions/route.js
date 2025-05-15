import {connectMongoDB} from "@/lib/mongodb";
import Question from "@/models/question";
import { NextResponse } from "next/server";


export async function GET() {
  await connectMongoDB()
  const questions = await Question.find();
  return NextResponse.json({ questions });
}

