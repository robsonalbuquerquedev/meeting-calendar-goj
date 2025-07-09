"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";
import AdminMeetingForm from "@/components/AdminMeetingForm";

export default function AdminPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                router.push("/login");
                setLoading(false);
                return;
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) return <p>Carregando...</p>;

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <AdminMeetingForm />
        </main>
    );
}
