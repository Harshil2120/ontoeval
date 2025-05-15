import {connectMongoDB} from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";


export async function GET() {
  await connectMongoDB();
  const topics = await User.find();
  return NextResponse.json({ topics });
}

