import { Webhook } from "svix"
import { headers } from "next/headers"
import { NextResponse, NextRequest } from "next/server"
import client from "../../../utils/db"

export async function POST(req: NextRequest) {
  try {
    const signingSecret = process.env.SIGNING_SECRET

    if (!signingSecret) {
      return NextResponse.json(
        { error: "Missing webhook signing secret" },
        { status: 500 }
      )
    }

    const wh = new Webhook(signingSecret)
    const headerPayload = await headers()

    const svixId = headerPayload.get("svix-id")
    const svixTimestamp = headerPayload.get("svix-timestamp")
    const svixSignature = headerPayload.get("svix-signature")

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing required svix headers" },
        { status: 400 }
      )
    }

    // Verify webhook payload sent by Clerk
    const payload = await req.json()
    const body = JSON.stringify(payload)
    const verification = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { data: any; type: string }
    const { data, type } = verification

    await client.connect()
    const db = client.db("kms_db")
    const usersCollection = db.collection("users")

    switch (type) {
      case "user.created": {
        const email = data.email_addresses?.[0]?.email_address

        if (!email) {
          console.error("Email not found:", data)
          return new Response("Email missing", { status: 400 })
        }

        await usersCollection.insertOne({
          _id: data.id,
          email: email,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        break
      }
      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address
        await usersCollection.updateOne(
          { _id: data.id },
          {
            $set: {
              ...(email && { email }),
              name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
              imageUrl: data.image_url,
              updatedAt: new Date(),
            },
          }
        )
        break
      }
      case "user.deleted": {
        await usersCollection.deleteOne({ _id: data.id })
        break
      }
      default:
        console.log("Unhandled event type: ", type)
    }

    return NextResponse.json({ message: "Event received" })
  } catch (error) {
    console.error("Clerk webhook verification failed:", error)
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    )
  }
}
