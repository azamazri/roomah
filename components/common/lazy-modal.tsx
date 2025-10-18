import dynamic from "next/dynamic";
import { LoadingSkeleton } from "./loading-skeleton";

/**
 * Lazy-loaded CandidateModal to reduce initial bundle size
 */
export const CandidateModalLazy = dynamic(
  () =>
    import("./candidate-modal").then((mod) => ({
      default: mod.CandidateModal,
    })),
  {
    loading: () => (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card rounded-lg p-8 max-w-2xl w-full mx-4">
          <LoadingSkeleton />
        </div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Lazy-loaded Dialog component
 */
export const DialogLazy = dynamic(
  () => import("../ui/dialog").then((mod) => ({ default: mod.Dialog })),
  {
    loading: () => (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
    ),
    ssr: false,
  }
);

