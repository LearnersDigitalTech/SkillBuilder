/**
 * Loading Screen Component
 */
import { motion } from 'framer-motion'

export default function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground">Loading...</h2>
                <p className="text-muted-foreground mt-2">Please wait</p>
            </motion.div>
        </div>
    )
}
