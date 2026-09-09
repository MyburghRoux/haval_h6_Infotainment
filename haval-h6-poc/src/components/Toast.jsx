import { motion, AnimatePresence } from 'framer-motion'

export default function Toast({ msg }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
        >
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
