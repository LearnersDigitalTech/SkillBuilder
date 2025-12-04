import { Roboto } from "next/font/google";
import "./globals.css";
import MuiProvider from "../components/MuiProvider/MuiProvider";
import QuizProvider from "./context/QuizSessionContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/context/AuthContext";

const roboto = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata = {
  metadataBase: new URL('https://math-conquest.vercel.app'),
  title: "Skill Conquest - National Mathematics Skills Proficiency Test",
  description: "Take the Math Skills Proficiency Test and discover your math mastery level. Personalized learning roadmaps and detailed reports.",
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: "Skill Conquest - National Mathematics Skills Proficiency Test",
    description: "Take the Math Skills Proficiency Test and discover your math mastery level. Personalized learning roadmaps and detailed reports.",
    url: 'https://math-conquest.vercel.app',
    siteName: 'Skill Conquest',
    images: [
      {
        url: '/logo.svg',
        width: 800,
        height: 600,
        alt: 'Skill Conquest Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Skill Conquest - National Mathematics Skills Proficiency Test",
    description: "Take the Math Skills Proficiency Test and discover your math mastery level. Personalized learning roadmaps and detailed reports.",
    images: ['/logo.svg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${roboto.variable}`}>
        <AuthProvider>
          <QuizProvider>
            <MuiProvider>{children}</MuiProvider>
            <ToastContainer />
          </QuizProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
