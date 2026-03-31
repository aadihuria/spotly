import { CreateGroupForm } from '@/components/groups/CreateGroupForm';

export default function NewGroupPage() {
  return (
    <div className="screen-width page-padding space-y-5">
      <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Create Study Group</h1>
      <CreateGroupForm />
    </div>
  );
}
