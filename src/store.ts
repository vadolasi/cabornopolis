import { create } from "zustand"
import { Socket, io } from "socket.io-client"
import parser from "socket.io-msgpack-parser"

type State = {
  socket: Socket
  name: string
  owner: boolean
  roomId: string
}

type Actions = {
  setName: (name: string) => void
  setOwner: (owner: boolean) => void
  setRoomId: (roomId: string) => void
}

const useStore = create<State & Actions>()((set) => ({
  socket: io("/", { parser }),
  name: "",
  owner: false,
  roomId: "",
  setName: (name) => set({ name }),
  setOwner: (owner) => set({ owner }),
  setRoomId: (roomId) => set({ roomId })
}))

export default useStore
