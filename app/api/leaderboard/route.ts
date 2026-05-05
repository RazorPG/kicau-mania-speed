import { NextRequest, NextResponse } from "next/server"
import client from "../../../utils/db"

export async function GET(req: NextRequest) {
  try {
    await client.connect()
    const db = client.db("kms_db")

    // Join scores with users
    const pipeline = [
      { $sort: { score: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          score: 1,
          name: "$user.name",
          imageUrl: "$user.imageUrl",
          email: "$user.email",
        },
      },
    ]

    const leaderboard = await db
      .collection("scores")
      .aggregate(pipeline)
      .toArray()

    return NextResponse.json({ success: true, data: leaderboard })
  } catch (error) {
    console.error("Failed to fetch leaderboard", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
