  /**
   * WorkMatch 2.0 — Toast Hook
   * Sistema de notificações global
   */
  import { useState, useCallback } from "react";

  export function useToast() {
    const [toast, setToast] = useState({ open: false, message: "", type: "success" });

    const showToast = useCallback((message, type = "success") => {
      setToast({ open: true, message, type });
    }, []);

    const hideToast = useCallback(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, []);

    return { toast, showToast, hideToast };
  }
