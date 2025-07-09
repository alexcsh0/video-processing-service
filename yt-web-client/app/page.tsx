import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { getVideos } from './utilities/functions';

export default async function Home() {
  const videos = await getVideos();

  return (
    <main>
      {
        videos.map((video) => (
          <Link href={`/watch?v=${video.filename}`} key={video.id}>
            <Image src={'/thumbnail.png'} alt='video' width={120} height={80}
              className={styles.thumbnail}/>
          </Link>
        ))
      }
    </main>
  )
}

export const revalidate = 30; // Disable caching for this page. Every 30 seconds, the page will be revalidated to fetch new data.

