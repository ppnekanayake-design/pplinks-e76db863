import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgeVerification({
  onVerified,
}: {
  onVerified: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("age_verified");
    if (verified === "true") {
      onVerified();
    } else {
      setShow(true);
    }
  }, [onVerified]);

  const handleYes = () => {
    localStorage.setItem("age_verified", "true");
    setShow(false);
    onVerified();
  };

  const handleNo = () => {
    window.location.href = "https://www.google.com";
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      >
        <div className="animated-bg absolute inset-0" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 mx-4 max-w-md rounded-2xl border border-border bg-card/90 p-8 text-center backdrop-blur-xl neon-glow"
        >
          <h1 className="mb-2 text-3xl font-bold text-primary neon-text">
            LINKVERSE
          </h1>
          <p className="mb-6 text-muted-foreground">
            This website contains content intended for users aged 16 and above.
          </p>
          <h2 className="mb-8 text-xl font-semibold text-foreground">
            Are you 16 or older?
          </h2>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleYes}
              className="rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:brightness-110 neon-glow"
            >
              Yes, I am 16+
            </button>
            <button
              onClick={handleNo}
              className="rounded-lg border border-border bg-secondary px-8 py-3 font-semibold text-secondary-foreground transition hover:bg-muted"
            >
              No
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
