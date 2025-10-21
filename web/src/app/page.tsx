export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">EverBloom</h1>
      <p className="text-gray-600">Grow together: chat, games, video, shared calendar, diaries.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a className="border rounded p-4 hover:bg-gray-50" href="/chat">Chat</a>
        <a className="border rounded p-4 hover:bg-gray-50" href="/video">Video Call</a>
        <a className="border rounded p-4 hover:bg-gray-50" href="/games">Games</a>
        <a className="border rounded p-4 hover:bg-gray-50" href="/calendar">Shared Calendar</a>
        <a className="border rounded p-4 hover:bg-gray-50" href="/diary">Diaries</a>
        <a className="border rounded p-4 hover:bg-gray-50" href="/date-ideas">Date Ideas</a>
      </div>
    </div>
  );
}
