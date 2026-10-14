export function NoteDate({ date }: { date: string }) {
  return <time dateTime={date}>{new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>;
}
