import { CreateGroupForm } from '@/components/groups/CreateGroupForm';

export default function NewGroupPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Create Study Group</h1>
      <CreateGroupForm />
    </section>
  );
}
