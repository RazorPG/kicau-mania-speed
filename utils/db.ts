import { MongoClient } from "mongodb"

const uri = process.env.DATABASE_URL

if (!uri) {
  throw new Error("DATABASE_URL tidak ditemukan")
}

let client: MongoClient

client = new MongoClient(uri, { maxPoolSize: 200, timeoutMS: 10000 })

export default client
