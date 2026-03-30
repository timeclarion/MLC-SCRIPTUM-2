export function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Metrics Cards */}
      <section className="mb-8">
        <div className="h-3 w-16 bg-[#F3F2EE] rounded-lg mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#F3F2EE]" />
              </div>
              <div className="h-8 w-16 bg-[#F3F2EE] rounded-lg mb-2" />
              <div className="h-3 w-20 bg-[#F3F2EE] rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity List */}
        <div className="lg:col-span-3">
          <div className="h-3 w-28 bg-[#F3F2EE] rounded-lg mb-4" />
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-[#F3F2EE] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-3.5 w-3/4 bg-[#F3F2EE] rounded-lg mb-2" />
                  <div className="h-3 w-1/2 bg-[#F3F2EE] rounded-lg mb-2" />
                  <div className="h-2.5 w-1/3 bg-[#F3F2EE] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Word Sync Section */}
        <div className="lg:col-span-2">
          <div className="h-3 w-32 bg-[#F3F2EE] rounded-lg mb-4" />
          {/* Connection Status */}
          <div className="bg-card rounded-xl border border-border p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F3F2EE] flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 w-32 bg-[#F3F2EE] rounded-lg mb-2" />
                <div className="h-2.5 w-40 bg-[#F3F2EE] rounded-lg" />
              </div>
            </div>
            <div className="h-9 w-full bg-[#F3F2EE] rounded-lg mt-4" />
          </div>
          {/* Sync History */}
          <div className="bg-card rounded-xl border border-border">
            <div className="px-4 py-3 border-b border-border">
              <div className="h-3.5 w-40 bg-[#F3F2EE] rounded-lg" />
            </div>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0"
              >
                <div className="w-6 h-6 rounded-full bg-[#F3F2EE] flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-[#F3F2EE] rounded-lg mb-1.5" />
                  <div className="h-2.5 w-16 bg-[#F3F2EE] rounded-lg" />
                </div>
                <div className="w-4 h-4 rounded-full bg-[#F3F2EE]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#F3F2EE] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-3.5 bg-[#F3F2EE] rounded-lg mb-2" style={{ width: `${60 + (i % 3) * 10}%` }} />
                <div className="h-3 bg-[#F3F2EE] rounded-lg" style={{ width: `${30 + (i % 4) * 8}%` }} />
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#F3F2EE] flex-shrink-0 ml-4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function UserListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#F3F2EE] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-3.5 bg-[#F3F2EE] rounded-lg mb-2" style={{ width: `${40 + (i % 3) * 12}%` }} />
                <div className="h-3 bg-[#F3F2EE] rounded-lg" style={{ width: `${50 + (i % 2) * 15}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-6 rounded-md bg-[#F3F2EE]" />
              <div className="w-12 h-4 rounded-lg bg-[#F3F2EE]" />
              <div className="w-8 h-8 rounded-lg bg-[#F3F2EE]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
