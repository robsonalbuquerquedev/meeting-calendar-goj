"use client";

import CalendarMeetings from "@/components/CalendarMeetings";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold text-[#264D73] mb-4">🗓️ Calendário de Encontros</h1>
      <CalendarMeetings />
    </main>
  );
}
