import { useEffect, useState } from "preact/hooks"
import useStore from "../../../store"
import toast from "react-hot-toast"

export default function() {
  const [money, setMoney] = useState(250)
  const [cdc, setCdc] = useState(100)
  const [availableAreas, setAvailableAreas] = useState<any[]>([])
  const [availableBuildings, setAvailableBuildings] = useState<any[]>([])
  const [position, setPosition] = useState(0)
  const { socket, owner } = useStore()
  const [myAreas, setMyAreas] = useState<any[]>([])
  const [myBuildings, setMyBuildings] = useState<any[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [buyed, setBuyed] = useState(false)

  useEffect(() => {
    let savedPosition = 0

    socket.emit("getInitialGameData")
    socket.on("money", (money: number, message?: string) => {
      setMoney(money)
      if (message) toast(message)
    })
    socket.on("cdc", (cdc: number, message?: string) => {
      setCdc(cdc)
      if (message) toast(message)
    })
    socket.on("availableBuilding", (index: number, toAdd: any) => {
      setAvailableBuildings((prev) => {
        prev[index] = toAdd
        return prev
      })
    })
    socket.on("availableArea", (index: number, toAdd: any) => {
      setAvailableAreas((prev) => {
        prev[index] = toAdd
        return prev
      })
    })
    socket.on("initialGameData", (position: number, areas: any[], buildings: any[]) => {
      savedPosition = position
      setPosition(position)
      setAvailableAreas(areas)
      setAvailableBuildings(buildings)
    })
    socket.on("current", (current: number) => {
      setCurrentPlayer(current)
      if (current == savedPosition) {
        toast("Sua vez de jogar!")
        setBuyed(false)
      } else {
        toast("Vez do jogador " + current)
      }
    })
    socket.on("area", (area: any) => {
      setMyAreas((prev) => [...prev, area])
    })
    socket.on("building", (building: any) => {
      setMyBuildings((prev) => [...prev, building])
    })
    socket.on("replaceArea", (index: number, area: any) => {
      setAvailableAreas(prev => {
        const newAreas = [...prev]
        newAreas[index] = area
        return newAreas
      })
    })
    socket.on("replaceBuilding", (index: number, building: any) => {
      setAvailableBuildings(prev => {
        const newBuildings = [...prev]
        newBuildings[index] = building
        return newBuildings
      })
    })
  }, [])

  const buyArea = (index: number) => {
    if (!buyed) {
      socket.emit("buyArea", index)
      setBuyed(true)
    }
  }

  const buyBuilding = (index: number) => {
    if (!buyed) {
      socket.emit("buyBuilding", index, String(Math.random()))
      setBuyed(true)
    }
  }

  return (
    <div>
      <div class="navbar flex bg-base-100 fixed z-50 gap-5">
        <span class="text-base-content">Dinheiro: R${money}</span>
        <span class="text-base-content">CdC: {cdc}</span>
        <span class="text-base-content">Posição: {position}</span>
      </div>
      <div class="pt-20">
        {currentPlayer == position && (<button class="btn btn-primary" onClick={() => socket.emit("next")}>Próximo</button>)}
        <div>
          <h1 class="text-2xl">Áreas disponíveis</h1>
          <div class="grid grid-cols-2 gap-4">
            {availableAreas.map((area, index) => (
              <div
                key={area.id}
                class="card bordered shadow-lg"
                onClick={() => {
                  socket.emit("buyArea", index)
                }}
              >
                <div class="card-body">
                  <h1 class="card-title">{area.name}</h1>
                  <p>Preço: R${area.price}</p>
                  <p>Custo de CdC: {area.cdcPrice}</p>
                  {position === currentPlayer && (
                    <button class="btn btn-primary" onClick={() => buyArea(index)} disabled={buyed}>
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div class="mt-10">
          <h1 class="text-2xl">Prédios disponíveis</h1>
          <div class="grid grid-cols-2 gap-4">
            {availableBuildings.map((building, index) => (
              <div
                key={building.id}
                class="card bordered shadow-lg"
              >
                <div class="card-body">
                  <h1 class="card-title">{building.name}</h1>
                  <p>Preço: R${building.price}</p>
                  <p>Custo de CdC: {building.cdcPrice}</p>
                  <p>Rendimento: R${building.moneyRent}</p>
                  <p>Rendimento (CdC): {building.cdcRent}</p>
                  <p>Rende a cada: {building.rentAt} partidas</p>
                  {position === currentPlayer && (
                    <button class="btn btn-primary" onClick={() => buyBuilding(index)} disabled={buyed}>
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div class="mt-10">
          <h1 class="text-2xl">Minhas áreas</h1>
          <div class="grid grid-cols-2 gap-4">
            {myAreas.map(area => (
              <div key={area.id} class="card bordered shadow-lg">
                <div key={area.id} class="card bordered shadow-lg">
                  <div class="card-body">
                    <h1 class="card-title">{area.name}</h1>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div class="mt-10">
          <h1 class="text-2xl">Minhas construções</h1>
          <div class="grid grid-cols-2 gap-4">
            {myBuildings.map(building => (
              <div key={building.id} class="card bordered shadow-lg">
                <div class="card-body">
                  <h1 class="card-title">{building.name}</h1>
                  <p>Rendimento: R${building.moneyRent}</p>
                  <p>Rendimento (CdC): {building.cdcRent}</p>
                  <p>Rende a cada: {building.rentAt} partidas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {owner && <button class="btn btn-error" onClick={() => socket.emit("ambiental")}>Desastre ambiental</button>}
    </div>
  )
}
