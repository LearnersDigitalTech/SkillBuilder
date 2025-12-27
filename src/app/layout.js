import { Roboto, Nunito, Great_Vibes } from "next/font/google";
import "./globals.css";
import MuiProvider from "../components/MuiProvider/MuiProvider";
import QuizProvider from "./context/QuizSessionContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/context/AuthContext";

const roboto = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ['100', '300', '400', '500', '700', '900'],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
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
        url: '/LearnersLogoTransparent.png',
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
    images: ['/LearnersLogoTransparent.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${roboto.variable} ${nunito.variable} ${greatVibes.variable}`}>
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
