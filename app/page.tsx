import Head from 'next/head';
import MusicControls from '../components/MusicControls'; // Direct Import (No SSR)

export default function Home() {
    return (
        <div>
            <Head>
                <title>Music Creator</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <main className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
                <MusicControls />
            </main>
        </div>
    );
}
