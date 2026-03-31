export default function EditProfilePage() {
  return (
    <form className="glass max-w-2xl space-y-3 rounded-2xl p-4">
      <h1 className="text-xl font-bold">Edit profile</h1>
      <input className="w-full rounded-lg bg-white/10 p-3" placeholder="Bio" />
      <input className="w-full rounded-lg bg-white/10 p-3" placeholder="Major" />
      <input className="w-full rounded-lg bg-white/10 p-3" placeholder="Graduation year" type="number" />
      <input className="w-full rounded-lg bg-white/10 p-3" placeholder="Interests (comma-separated)" />
      <button className="btn-glow">Save changes</button>
    </form>
  );
}
