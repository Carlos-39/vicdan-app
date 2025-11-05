// src/lib/date-utils.ts

export function formatDistanceToNow(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInMs = now.getTime() - target.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (diffInSeconds < 60) {
    return 'Hace unos segundos'
  } else if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
  } else if (diffInDays < 30) {
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  } else if (diffInMonths < 12) {
    return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`
  } else {
    return `Hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`
  }
}

export function formatDate(date: string | Date): string {
  const target = new Date(date)
  
  const day = target.getDate().toString().padStart(2, '0')
  const month = (target.getMonth() + 1).toString().padStart(2, '0')
  const year = target.getFullYear()
  
  const hours = target.getHours().toString().padStart(2, '0')
  const minutes = target.getMinutes().toString().padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}