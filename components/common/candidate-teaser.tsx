import { getCandidates } from "@/features/candidates/server/list";
import { CandidateCard } from "./candidate-card";
import { Pagination } from "./pagination";

interface CandidateTeaserProps {
  page: number;
  pageSize: number;
  baseUrl: string;
}

export default async function CandidateTeaser({
  page,
  pageSize,
  baseUrl,
}: CandidateTeaserProps) {
  const { candidates, totalPages } = await getCandidates(page, pageSize);

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">
            Tidak ada kandidat ditemukan
          </h3>
          <p>Coba ubah filter pencarian Anda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid kandidat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            showTaarufButton={true}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl={baseUrl}
        />
      )}
    </div>
  );
}
