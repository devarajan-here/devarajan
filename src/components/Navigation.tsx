import { motion } from 'framer-motion';

export default function Navigation() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-xl font-bold text-white cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Portfolio
        </motion.div>
        <div />
      </div>
    </motion.nav>
  );
}