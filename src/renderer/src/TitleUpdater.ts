// title-management-module.ts (or wherever this code lives)

let rollNumber: number | string = '?'
let docTitle: string = 'Welcome to Showcut'

const dispatchTitleUpdate = (): void => {
  const event = new CustomEvent('documentTitleUpdated')
  window.dispatchEvent(event)
}

export const updateTitle = (number: number | string, title: string): void => {
  rollNumber = number
  docTitle = title
  document.title = `[${rollNumber}] ${docTitle}`
  dispatchTitleUpdate()
}

export const resetTitle = (): void => {
  rollNumber = '?'
  docTitle = 'Welcome to Showcut'
  document.title = docTitle
  dispatchTitleUpdate()
}

export const getTitle = (): { number: number | string; title: string } => {
  return { number: rollNumber, title: docTitle }
}
