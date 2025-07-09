"use client";

import { useEffect, useState } from "react";
import { ref, set, get } from "firebase/database";
import { database } from "@/firebase/config";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

export default function AdminMeetingForm() {
    const [date, setDate] = useState<Date | null>(new Date());
    const [theme, setTheme] = useState("");
    const [preacher, setPreacher] = useState("");
    const [location, setLocation] = useState("");
    const [success, setSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const searchParams = useSearchParams();
    const dateParam = searchParams.get("data");

    // Se tiver ?data=yyyy-MM-dd na URL, usa essa data
    useEffect(() => {
        if (dateParam) {
            const [year, month, day] = dateParam.split("-").map(Number);
            setDate(new Date(year, month - 1, day));
        }
    }, [dateParam]);

    // Carregar dados se houver data
    useEffect(() => {
        if (!date) return;

        const dateStr = format(date, "yyyy-MM-dd");
        const meetingRef = ref(database, `encontros/${dateStr}`);

        get(meetingRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setTheme(data.theme);
                setPreacher(data.preacher || "");
                setLocation(data.location || "");
                setIsEditing(true);
            } else {
                setTheme("");
                setPreacher("");
                setLocation("");
                setIsEditing(false);
            }
        });
    }, [date]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) return;

        const dateStr = format(date, "yyyy-MM-dd");
        const meetingRef = ref(database, `encontros/${dateStr}`);

        await set(meetingRef, {
            theme,
            preacher,
            location,
        });

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg mx-auto mt-6">
            <h2 className="text-xl font-bold mb-4 text-[#264D73]">
                🧑‍💻 {isEditing ? "Editar" : "Adicionar"} Encontro
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label>
                    Data:
                    <input
                        type="date"
                        value={date ? format(date, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                            const [year, month, day] = e.target.value.split("-").map(Number);
                            setDate(new Date(year, month - 1, day));
                        }}
                        className="w-full border px-2 py-1 rounded"
                        required
                    />
                </label>

                <label>
                    Tema:
                    <input
                        type="text"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full border px-2 py-1 rounded"
                        required
                    />
                </label>

                <label>
                    Pregador:
                    <input
                        type="text"
                        value={preacher}
                        onChange={(e) => setPreacher(e.target.value)}
                        className="w-full border px-2 py-1 rounded"
                        placeholder="Opcional"
                    />
                </label>

                <label>
                    Local:
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full border px-2 py-1 rounded"
                        placeholder="Opcional"
                    />
                </label>

                <button
                    type="submit"
                    className="bg-[#264D73] text-white px-4 py-2 rounded hover:bg-[#1b3552] cursor-pointer"
                >
                    {isEditing ? "Atualizar Encontro" : "Salvar Encontro"}
                </button>

                {success && (
                    <p className="text-green-600 font-semibold">
                        ✅ Encontro {isEditing ? "atualizado" : "salvo"} com sucesso!
                    </p>
                )}
            </form>
        </div>
    );
}
