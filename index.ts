import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { Server } from "socket.io"
import parser from "socket.io-msgpack-parser"
import ViteExpress from "vite-express"

interface builddingToAdd {
  id: string
  name: string
  price: number
  cdcPrice: number
  moneyRent: number
  cdcRent: number
  rentAt: number
  quantity: number
  maxQuantity: number
}

interface AreaToAdd {
  id: string
  name: string
  price: number
  cdcPrice: number
  quantity: number
  building?: builddingToAdd
}

const areasToAdd: AreaToAdd[] = [
  { id: "rua1", name: "Rua", price: 50, quantity: 10, cdcPrice: 10 },
  { id: "rua2", name: "Esquina (direita)", price: 50, quantity: 5, cdcPrice: 10 },
  { id: "rua3", name: "Esquina (esquerda)", price: 50, quantity: 5, cdcPrice: 10 },
  { id: "usina_eolica", name: "Usina eólica", price: 100, quantity: 4, building: { id: "torre_eolica", name: "Torre eólica", price: 100, moneyRent: 50, cdcRent: 5, rentAt: 2, cdcPrice: 20, quantity: 6, maxQuantity: 6 }, cdcPrice: 20 },
  { id: "usina_solar", name: "Usina solar", price: 100, quantity: 6, building: { id: "painel_solar", name: "Painel solar", price: 80, moneyRent: 30, cdcRent: 10, rentAt: 2, cdcPrice: 20, quantity: 4, maxQuantity: 12 }, cdcPrice: 20 },
  { id: "praca", name: "Praça", price: 60, quantity: 3, building: { id: "planta", name: "Planta", price: 50, moneyRent: 15, cdcRent: 30, rentAt: 2, cdcPrice: 20, quantity: 4, maxQuantity: 10 }, cdcPrice: 20 },
  { id: "fabrica", name: "Fabrica", price: 200, quantity: 3, building: { id: "fabrica", name: "Fábrica", price: 200, moneyRent: 40, cdcRent: -20, rentAt: 2, cdcPrice: 20, quantity: 3, maxQuantity: 9 }, cdcPrice: 20 },
  { id: "mina", name: "Mina", price: 200, quantity: 3, building: { id: "mina", name: "Mina", price: 200, moneyRent: 120, cdcRent: -50, rentAt: 3, cdcPrice: 20, quantity: 3, maxQuantity: 9 }, cdcPrice: 20 },
]

class Building {
  id: string
  name: string
  price: number
  cdcPrice: number
  moneyRent: number
  cdcRent: number
  rentAt: number

  constructor(id: string, name: string, price: number, cdcPrice: number, moneyRent: number, cdcRent: number, rentAt: number) {
    this.id = id
    this.name = name
    this.price = price
    this.cdcPrice = cdcPrice
    this.moneyRent = moneyRent
    this.cdcRent = cdcRent
    this.rentAt = rentAt
  }
}

class Area {
  id: string
  name: string
  price: number
  cdcPrice: number
  buildings: Building[] = []

  constructor(id: string, name: string, price: number, cdcPrice: number) {
    this.id = id
    this.name = name
    this.price = price
    this.cdcPrice = cdcPrice
  }
}

const buildings: Building[] = []
const areas: Area[] = []

for (const areaToAdd of areasToAdd) {
  for (let i = 1; i <= areaToAdd.quantity; i++) {
    const area = new Area(`${areaToAdd.id}_${i}`, areaToAdd.name, areaToAdd.price, areaToAdd.cdcPrice)
    areas.push(area)
  }
  const buildingToAdd = areaToAdd.building
  if (buildingToAdd) {
    for (let i = 1; i <= buildingToAdd.maxQuantity; i++) {
      const building = new Building(`${buildingToAdd.id}_${i}`, buildingToAdd.name, buildingToAdd.price, buildingToAdd.cdcPrice, buildingToAdd.moneyRent, buildingToAdd.cdcRent, buildingToAdd.rentAt)
      buildings.push(building)
    }
  }
}

class User {
  name: string
  money = 250
  cdc = 100
  owner: boolean
  areas: Area[] = []
  buildings: Building[] = []
  round = 1
  socketId?: string

  constructor(name: string, owner = false) {
    this.name = name
    this.owner = owner
  }

  setSocketId(socketId: string) {
    this.socketId = socketId
  }

  addArea(area: Area) {
    this.areas.push(area)
  }

  removeArea(areaId: string) {
    const index = this.areas.findIndex(area => area.id === areaId)
    if (index === -1) return

    this.areas.splice(index, 1)
  }

  getAreas() {
    return this.areas
  }

  addBuilding(building: Building, areaId: string) {
    const area = this.areas.find(area => area.id === areaId)
    if (!area) return

    area.buildings.push(building)
  }

  addRound() {
    this.round++
  }

  setMoney(money: number) {
    this.money = money
  }

  setCDC(cdc: number) {
    this.cdc = cdc
  }
}

class Room {
  current = 1
  owner: string
  users = new Map<string, User>()
  started = false
  availableAreas: Area[] = areas
  availableBuildings: Building[] = buildings
  currentAreas: Area[] = Array.from({ length: 5 }, () => {
    const index = Math.floor(Math.random() * this.availableAreas.length)
    const area = this.availableAreas[index]
    this.availableAreas.splice(index, 1)
    return area
  })
  currentBuildings: Building[] = Array.from({ length: 5 }, () => {
    const index = Math.floor(Math.random() * this.availableBuildings.length)
    const building = this.availableBuildings[index]
    this.availableBuildings.splice(index, 1)
    return building
  })

  constructor(owner: string) {
    this.owner = owner
  }

  addUser(name: string, owner = false) {
    this.users.set(name, new User(name, owner))
  }

  getUsers() {
    return Array.from(this.users.values())
  }

  start() {
    this.started = true
  }

  setCurrent(current: number) {
    this.current = current
  }
}

class RommsManager {
  rooms = new Map<string, Room>()

  createRoom(ownerName: string) {
    const id = String(Math.floor(Math.random() * 10000) + 10000)

    const room = new Room(ownerName)
    room.addUser(ownerName, true)

    this.rooms.set(id, room)

    return id
  }

  getUsers(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return []

    return room.getUsers()
  }
}

const roomsManager = new RommsManager()

const app = express()
app.use(cors())
app.use(helmet({ contentSecurityPolicy: false }))
app.use(morgan("tiny"))
app.use(express.json())

app.post("/api/rooms", (req, res) => {
  const { name } = req.body

  const id = roomsManager.createRoom(name)

  res.json({ id })
})

app.post("/api/rooms/:id", (req, res) => {
  const { id } = req.params

  const room = roomsManager.rooms.get(id)

  if (!room) {
    res.status(404).json({ error: "Sala não encontrada!" })
    return
  } else if (room.started) {
    res.status(400).json({ error: "Este jogo já começou!" })
    return
  }

  const { name } = req.body

  room.addUser(name)

  res.json({ users: room.getUsers().map(user => ({ name: user.name, owner: user.owner })) })
})

const server = ViteExpress.listen(app, 3000, () => console.log("Listening on http://localhost:3000"))
const io = new Server(server, { parser, cors: { origin: "*" } })
io.on("connection", socket => {
  socket.on("join", (name: string, room: string) => {
    const users = roomsManager.getUsers(room)
    if (users.length === 0) {
      socket.emit("error", "Sala não encontrada!")
      return
    }

    const user = users.find(user => user.name === name)
    if (!user) {
      socket.emit("error", "Usuário não encontrado!")
      return
    }

    user.setSocketId(socket.id)

    socket.join(room)
    socket.to(room).emit("joined", name)

    socket.on("start", () => {
      socket.to(room).emit("started")

      setTimeout(() => {
        io.to(room).emit("current", 1)
      }, 1000)
    })

    socket.on("disconnect", () => {
      socket.to(room).emit("left", name)
    })

    socket.on("getInitialGameData", () => {
      const roomOb = roomsManager.rooms.get(room)!
      if (!room) return

      socket.emit(
        "initialGameData",
        roomOb.getUsers().map(user => user.name).indexOf(name) + 1,
        roomOb.currentAreas.map(area => ({ id: area.id, name: area.name, price: area.price, cdcPrice: area.cdcPrice })),
        roomOb.currentBuildings.map(building => ({ id: building.id, name: building.name, price: building.price, cdcPrice: building.cdcPrice, moneyRent: building.moneyRent, cdcRent: building.cdcRent, rentAt: building.rentAt }))
      )
    })

    socket.on("next", () => {
      let next = roomsManager.rooms.get(room)!.current + 1
      if (next > roomsManager.rooms.get(room)!.getUsers().length) {
        next = 1
      }
      roomsManager.rooms.get(room)!.setCurrent(next)

      const users = roomsManager.rooms.get(room)!.getUsers()
      const user = users[next - 1]
      user.addRound()
      let newMoney = 0
      let newCdc = 0

      user.buildings.forEach(building => {
        if (user.round % building.rentAt === 0) {
          newMoney += building.moneyRent
          newCdc += building.cdcRent
        }
      })

      if (newMoney !== 0) {
        user.money += newMoney
        io.to(user.socketId!).emit("money", user.money, `Você recebeu R$${newMoney}!`)
      }

      if (newCdc !== 0) {
        user.cdc += newCdc
        io.to(user.socketId!).emit("cdc", user.cdc, `Você recebeu ${newCdc} CdC!`)
      }

      io.to(room).emit("current", roomsManager.rooms.get(room)!.current)
    })

    socket.on("ambiental", () => {
      const users = roomsManager.rooms.get(room)!.getUsers()

      for (const user of users) {
        const moneyLoss = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 40) + 10
        user.money -= moneyLoss
        io.to(user.socketId!).emit("money", user.money, moneyLoss === 0 ? "Você passou ileso dessa!" : `Você perdeu R$${moneyLoss}!`)
      }
    })

    let last_ba = ""

    socket.on("buyArea", (index: number) => {
      const current_b = `${name}_${index}`
      if (last_ba === current_b) return
      last_ba = current_b

      const roomOb = roomsManager.rooms.get(room)!
      if (!room) return

      const user = roomOb.getUsers().find(user => user.name === name)!
      const area = roomOb.currentAreas[index]

      if (user.money < area.price) {
        socket.emit("error", "Você não tem dinheiro suficiente!")
        return
      }

      if (user.cdc < area.cdcPrice) {
        socket.emit("error", "Você não tem CdC suficiente!")
        return
      }

      const randomIndex = Math.floor(Math.random() * roomOb.availableAreas.length)
      roomOb.currentAreas[index] = roomOb.availableAreas[randomIndex]
      roomOb.availableAreas.splice(randomIndex, 1)
      user.money -= area.price
      user.cdc -= area.cdcPrice
      user.addArea(area)

      io.to(user.socketId!).emit("money", user.money, `Você comprou ${area.name} por R$${area.price}! e ${area.cdcPrice} CdC!`)
      io.to(user.socketId!).emit("cdc", user.cdc)
      io.to(user.socketId!).emit("area", { id: area.id, name: area.name, price: area.price, cdcPrice: area.cdcPrice })
      io.to(room).emit("replaceArea", index, { id: area.id, name: area.name, price: area.price, cdcPrice: area.cdcPrice })
    })

    let last_bb = ""

    socket.on("buyBuilding", (index: number, areaId: string) => {
      const current_b = `${name}_${index}`
      if (last_bb === current_b) return
      last_bb = current_b

      const roomOb = roomsManager.rooms.get(room)!
      if (!room) return

      const user = roomOb.getUsers().find(user => user.name === name)!
      const building = roomOb.currentBuildings[index]

      if (user.money < building.price) {
        socket.emit("error", "Você não tem dinheiro suficiente!")
        return
      }

      if (user.cdc < building.cdcPrice) {
        socket.emit("error", "Você não tem CdC suficiente!")
        return
      }

      const randomIndex = Math.floor(Math.random() * roomOb.availableBuildings.length)
      roomOb.currentBuildings[index] = roomOb.availableBuildings[randomIndex]
      roomOb.availableBuildings.splice(randomIndex, 1)
      user.money -= building.price
      user.cdc -= building.cdcPrice
      user.addBuilding(building, areaId)

      io.to(user.socketId!).emit("money", user.money, `Você comprou ${building.name} por R$${building.price}! e ${building.cdcPrice} CdC!`)
      io.to(user.socketId!).emit("cdc", user.cdc)
      io.to(user.socketId!).emit("building", { areaId, id: building.id, name: building.name, price: building.price, cdcPrice: building.cdcPrice, moneyRent: building.moneyRent, cdcRent: building.cdcRent, rentAt: building.rentAt })
      io.to(room).emit("replaceBuilding", index, { id: building.id, name: building.name, price: building.price, cdcPrice: building.cdcPrice, moneyRent: building.moneyRent, cdcRent: building.cdcRent, rentAt: building.rentAt })
    })
  })
})
