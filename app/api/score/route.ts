import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import client from "../../../utils/db"

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await client.connect()
    const db = client.db("kms_db")
    const scoresCollection = db.collection("scores")

    const result = await scoresCollection.findOne({ userId })

    return NextResponse.json({ score: result?.score || 0 })
  } catch (error) {
    console.error("Failed to fetch score", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { score } = await req.json()

    if (typeof score !== "number") {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 })
    }

    await client.connect()
    const db = client.db("kms_db")
    const scoresCollection = db.collection("scores")

    // 🔥 Inti logika: update hanya jika score lebih besar
    const result: any = await scoresCollection.findOneAndUpdate(
      { userId },
      {
        $max: { score: score }, // hanya update kalau score lebih besar
        $setOnInsert: {
          userId,
          createdAt: new Date(),
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    )

    return NextResponse.json({
      success: true,
      score: result.value?.score,
    })
  } catch (error) {
    console.error("Failed to update score", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
