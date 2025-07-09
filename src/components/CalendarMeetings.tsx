"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { ref, get, remove } from "firebase/database";
import { database } from "@/firebase/config";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

type CalendarValue = Date | null | [Date, Date] | [Date, null] | [null, Date] | [null, null];

type Meeting = {
    theme: string;
    preacher?: string;
    location?: string;
};

export default function CalendarMeetings() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [meetingDates, setMeetingDates] = useState<Set<string>>(new Set());
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const roleRef = ref(database, `usuarios_web/${user.uid}/role`);
                const snapshot = await get(roleRef);
                if (snapshot.exists()) {
                    const role = snapshot.val();
                    if (role === "admin" || role === "moderador") {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } else {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });

        return () => unsubscribe();
    }, []);
    
    // Carrega todas as datas com encontro
    useEffect(() => {
        const encontrosRef = ref(database, "encontros");
        get(encontrosRef).then((snapshot) => {
            if (snapshot.exists()) {
                const encontrosData = snapshot.val();
                const foundDates = Object.keys(encontrosData);
                setMeetingDates(new Set(foundDates));
            }
        });
    }, []);

    // Carrega o encontro da data selecionada
    useEffect(() => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const meetingRef = ref(database, `encontros/${dateStr}`);

        get(meetingRef).then((snapshot) => {
            if (snapshot.exists()) {
                setMeeting(snapshot.val());
            } else {
                setMeeting(null);
            }
        });
    }, [selectedDate]);

    // 🧽 Função para excluir encontro
    const handleDelete = async () => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const meetingRef = ref(database, `encontros/${dateStr}`);

        await remove(meetingRef);
        setMeeting(null);
        setMeetingDates((prev) => {
            const updated = new Set(prev);
            updated.delete(dateStr);
            return updated;
        });
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <Calendar
                onChange={(value: CalendarValue) => {
                    if (value instanceof Date) {
                        setSelectedDate(value);
                    } else if (Array.isArray(value)) {
                        setSelectedDate(value[0] ?? null);
                    } else {
                        setSelectedDate(null);
                    }
                }}
                value={selectedDate}
                tileContent={({ date, view }) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    if (view === "month" && meetingDates.has(dateStr)) {
                        return (
                            <div className="flex justify-center mt-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                            </div>
                        );
                    }
                    return null;
                }}
            />

            {selectedDate && (
                <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-md">
                    {meeting ? (
                        <>
                            <h3 className="text-xl font-bold text-[#264D73] mb-2">
                                Encontro em {format(selectedDate, "dd/MM/yyyy")}
                            </h3>
                            <p><strong>Tema:</strong> {meeting.theme}</p>
                            {meeting.preacher && <p><strong>Pregador:</strong> {meeting.preacher}</p>}
                            {meeting.location && <p><strong>Local:</strong> {meeting.location}</p>}

                            {isAdmin && (
                                <button
                                    onClick={handleDelete}
                                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
                                >
                                    Excluir Encontro
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-600">Nenhum encontro programado para esse dia.</p>
                    )}
                </div>
            )}
        </div>
    );
}
