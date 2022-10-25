export const currentDateAfterMs = (msPast: number) =>
  dateAfterMs(Date.now(), msPast)

export const dateAfterMs = (currentDate: number, msPast: number): Date =>
  new Date(currentDate + msPast)
