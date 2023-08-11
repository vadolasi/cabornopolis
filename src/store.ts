import { create } from "zustand"
import { Socket } from "socket.io-client"

type State = {
  socket: Socket | null
}

type Actions = {
  setSocket: (socket: Socket) => void
}

const useStore = create<State & Actions>()((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket })
}))

export default useStore
