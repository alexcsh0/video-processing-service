'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function WatchInner() {
  const videoPrefix = `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_PROCESSED_VIDEOS_BUCKET}/`;
  const videoSrc = useSearchParams().get('v');

  return (
    <div>
      <h1>Watch Page</h1>
      <video controls src={videoPrefix + videoSrc} />
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function WatchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WatchInner />
    </Suspense>
  );
}