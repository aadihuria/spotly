import Link from 'next/link';

export default function ProfilePage({ params }: { params: { username: string } }) {
  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <h1 className="text-2xl font-bold">@{params.username}</h1>
        <p className="text-sm text-white/70">CS major · Class of 2027</p>
      </div>
      <Link href="/profile/edit" className="btn-glow inline-block">Edit profile</Link>
    </section>
  );
}
