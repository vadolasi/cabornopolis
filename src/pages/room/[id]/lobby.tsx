import { useEffect, useState } from "preact/hooks"
import useStore from "../../../store"
import { useSearchParams, useNavigate } from "react-router-dom"

export default function() {
  const { socket, name, owner, roomId } = useStore()
  const [serachParams] = useSearchParams()
  const navigate = useNavigate()
  const [users, setUsers] = useState<{ name: string, owner: boolean }[]>([{ name, owner }, ...JSON.parse(serachParams.get("users") || "[]")])

  useEffect(() => {
    socket.on("joined", (name: string) => {
      if (users.find(user => user.name === name)) return
      setUsers(users => [...users, { name, owner: false }])
    })
    socket.on("left", (name: string) => {
      setUsers(users => users.filter(user => user.name !== name))
    })
    socket.on("started", () => {
      navigate(`/room/${roomId}`)
    })
  }, [])

  const start = () => {
    socket.emit("start")
    navigate(`/room/${roomId}`)
  }

  return (
    <div class="h-screen w-full flex items-center justify-center">
      <div class="w-full max-w-xs p-5">
        {owner && (
          <h1 class="text-xl font-medium mb-4">Código da sala: {roomId}</h1>
        )}
        <h1 class="text-2xl font-medium mb-4">Jogadores</h1>
        <ul class="list-reset">
          {users.map(user => (
            <li class="flex items-center" key={user.name}>
              <div class="flex-1 font-medium">{user.name}</div>
              {user.owner && <div class="text-xs text-grey-dark">Anfitrião</div>}
            </li>
          ))}
        </ul>
        {owner && (
          <div class="mt-4">
            <button class="btn btn-primary w-full" onClick={start}>Começar</button>
          </div>
        )}
      </div>
    </div>
  )
}
