import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'vas_selected_hall'

const SupervisionContext = createContext(null)

function readStoredHall() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function SupervisionProvider({ children }) {
  const [selectedHall, setSelectedHallState] = useState(() => readStoredHall())

  useEffect(() => {
    if (selectedHall) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedHall))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [selectedHall])

  const selectHall = (hall) => {
    setSelectedHallState(
      hall
        ? {
            id: hall.id,
            name: hall.name,
            location: hall.location || '',
            capacity: hall.capacity ?? 0,
            camera_count: hall.camera_count ?? hall.cameras?.length ?? 0,
          }
        : null,
    )
  }

  const clearHall = () => setSelectedHallState(null)

  return (
    <SupervisionContext.Provider
      value={{ selectedHall, selectHall, clearHall }}
    >
      {children}
    </SupervisionContext.Provider>
  )
}

export const useSupervision = () => useContext(SupervisionContext)
