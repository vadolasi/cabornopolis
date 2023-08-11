import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { Server } from "socket.io"
import parser from "socket.io-msgpack-parser"
import ViteExpress from "vite-express"

interface Room {
  owner: string
  users: string[]
}

const rooms = new Map<string, Room>()

const app = express()
app.use(cors())
app.use(helmet({ contentSecurityPolicy: false }))
app.use(morgan("tiny"))
app.use(express.json())

app.post("/api/rooms", (req, res) => {
  const { name } = req.body

  const id = String(Math.floor(Math.random() * 10000) + 10000)

  rooms.set(id, { owner: name, users: [name] })

  res.json({ id })
})

const server = ViteExpress.listen(app, 3000, () => console.log("Listening on http://localhost:3000"))
const socket = new Server(server, { parser, cors: { origin: "*" } })
socket.on("connection", socket => {
  socket.on("join", (room: string) => {
    socket.join(room)
    socket.to(room).emit("joined", room)

    socket.on("disconnect", () => {
      socket.to(room).emit("left", room)
    })
  })
})

