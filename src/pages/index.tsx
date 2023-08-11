import { useNavigate } from "react-router-dom"
import useStore from "../store"
import { io } from "socket.io-client"
import parser from "socket.io-msgpack-parser"
import { useState } from "preact/hooks"

export default function () {
  const [name, setName] = useState("")

  const navigate = useNavigate()

  const setSocket = useStore(state => state.setSocket)

  const createRoom = async () => {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    })

    const { id } = await res.json()

    const socket = io("/", {
      parser,
      rejectUnauthorized: false
    })

    setSocket(socket)

    socket.on("connect", () => {
      socket.emit("join", id)
      navigate(`/room/${id}/lobby`)
    })
  }

  return (
    <div class="h-screen w-full flex items-center justify-center">
      <div class="w-full max-w-xs p-5">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Nome *</span>
          </label>
          <input type="text" className="input input-bordered w-full max-w-sm" value={name} onChange={e => setName(e.currentTarget.value)} />
        </div>
        <div className="form-control w-full mt-10">
          <label className="label">
            <span className="label-text">Código</span>
          </label>
          <input type="number" className="input input-bordered w-full max-w-sm" />
        </div>
        <button class="btn w-full mt-5">Entrar</button>
        <div className="divider">OU</div>
        <button class="btn btn-primary w-full" onClick={createRoom}>Criar sala</button>
      </div>
    </div>
  )
}
