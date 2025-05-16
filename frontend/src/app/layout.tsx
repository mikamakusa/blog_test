import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Multilingual Blog",
    description: "A blog with multiple language support",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html>
            <body>{children}</body>
        </html>
    );
}