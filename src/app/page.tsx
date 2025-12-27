import { Metadata } from 'next';
import Header from './homepage/Header';
import HeroSection from './homepage/HeroSection';
import PositioningSection from './homepage/PositioningSection';
import ChildOutcomesSection from './homepage/ChildOutcomesSection';
import ParentOutcomesSection from './homepage/ParentOutcomesSection';
import EligibilitySection from './homepage/EligibilitySection';
import ContextSection from './homepage/ContextSection';
import JoySection from './homepage/JoySection';
import HallOfFame from './homepage/HallOfFame';
import FinalCTASection from './homepage/FinalCTASection';
import FAQSection from './homepage/FAQSection';
import Footer from './homepage/Footer';

export const metadata: Metadata = {
    title: "Discover Your Child's Math Superpowers | National Mathematics Day",
    description: "A joyful, pressure-free experience for Grades 1-10 that helps children feel confident about numbers. No stress, no judgment, no competition.",
    keywords: "math assessment, children math, National Mathematics Day, Ramanujan, math confidence, stress-free learning",
    alternates: {
        canonical: '/',
    },
};

export default function Home() {
    return (
        <main className="overflow-hidden">
            <Header />
            <HeroSection />
            <PositioningSection />
            <ChildOutcomesSection />
            <ParentOutcomesSection />
            {/* <EligibilitySection /> */}
            {/* <JoySection /> */}
            <HallOfFame />
            <ContextSection />
            <FinalCTASection />
            {/* <FAQSection /> */}
            {/* <Footer /> */}
        </main>
    );
}
