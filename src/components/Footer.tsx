// components/Footer.tsx
import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-white border-t shadow-inner mt-10 text-sm text-[#264D73]">
            <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* 🔗 Links úteis */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <Link href="/" className="hover:underline">Início</Link>
                    <Link href="https://galeria-dos-santos.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Galeria dos Santos
                    </Link>
                </div>

                {/* 📱 Redes sociais */}
                <div className="flex gap-4 items-center">
                    <a
                        href="https://www.instagram.com/goj_saofrancisco?igsh=dGppYWRrbGxvMTU3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pink-600 transition"
                        aria-label="Instagram"
                    >
                        <FaInstagram size={20} />
                    </a>
                    <a
                        href="https://wa.me/5581971168633"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-600 transition"
                        aria-label="WhatsApp"
                    >
                        <FaWhatsapp size={20} />
                    </a>
                </div>
            </div>

            {/* 👨‍💻 Créditos */}
            <div className="text-center text-xs text-gray-500 py-2 border-t">
                © {new Date().getFullYear()} GOJ São Francisco • Desenvolvido com 💙 por Robson
            </div>
        </footer>
    );
}
