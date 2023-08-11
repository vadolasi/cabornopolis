import { useNavigate } from "react-router-dom"
import useStore from "../store"
import { useState } from "preact/hooks"

export default function () {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")

  const navigate = useNavigate()

  const { socket, setName: setSavedName, setOwner, setRoomId } = useStore()

  const createRoom = async () => {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    })

    const { id } = await res.json()

    setRoomId(id)
    setSavedName(name)
    setOwner(true)
    socket.emit("join", name, id)
    navigate(`/room/${id}/lobby`)
  }

  const joinRoom = async () => {
    const res = await fetch(`/api/rooms/${code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    })

    const { users } = await res.json()

    if (users) {
      setRoomId(code)
      setSavedName(name)
      setOwner(false)
      socket.emit("join", name, code)
      navigate(`/room/${code}/lobby?users=${JSON.stringify(users.filter((user: any) => user.name !== name))}`)
    }
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
          <input type="number" className="input input-bordered w-full max-w-sm" value={code} onChange={e => setCode(e.currentTarget.value)} />
        </div>
        <button class="btn w-full mt-5" onClick={joinRoom}>Entrar</button>
        <div className="divider">OU</div>
        <button class="btn btn-primary w-full" onClick={createRoom}>Criar sala</button>
      </div>
    </div>
  )
}
