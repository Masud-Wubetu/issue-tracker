'use client';

import { useEffect, useState } from 'react';
import {
  Badge, Box, Button, Callout, Checkbox, Dialog, Flex, Heading, Select, Separator, Text
} from '@radix-ui/themes';
import axios from 'axios';
import { Spinner } from '@/app/component';

type User = {
  id: string; name: string | null; email: string | null;
  role: string; isActive: boolean;
  projects: { id: number; name: string }[];
};
type Project = { id: number; name: string };

interface Props {
  user: User | null;
  projects: Project[];
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditUserDialog({ user, projects, onClose, onUpdated }: Props) {
  const [role, setRole] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setSelectedProjects(user.projects.map(p => p.id));
      setError('');
    }
  }, [user]);

  const toggleProject = (id: number) => {
    setSelectedProjects(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await axios.patch(`/api/users/${user.id}`, { role, projectIds: selectedProjects });
      onUpdated();
      onClose();
    } catch {
      setError('Failed to save changes.');
    } finally { setSaving(false); }
  };

  const toggleActive = async () => {
    if (!user) return;
    setToggling(true);
    try {
      await axios.patch(`/api/users/${user.id}`, { isActive: !user.isActive });
      onUpdated();
      onClose();
    } catch {
      setError('Failed to update status.');
    } finally { setToggling(false); }
  };

  return (
    <Dialog.Root open={!!user} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Content maxWidth="480px">
        <Dialog.Title>Edit User</Dialog.Title>
        {user && (
          <>
            <Flex align="center" gap="3" mb="4">
              <Box>
                <Text as="p" size="3" weight="bold">{user.name}</Text>
                <Text as="p" size="2" color="gray">{user.email}</Text>
              </Box>
              <Badge color={user.isActive ? 'green' : 'red'} ml="auto">
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Flex>

            {error && <Callout.Root color="red" mb="3"><Callout.Text>{error}</Callout.Text></Callout.Root>}

            <Flex direction="column" gap="4">
              {/* Role */}
              <Box>
                <Text as="label" size="2" weight="medium">Role</Text>
                <Select.Root value={role} onValueChange={setRole}>
                  <Select.Trigger mt="1" className="w-full" />
                  <Select.Content>
                    <Select.Item value="ADMIN">Admin</Select.Item>
                    <Select.Item value="MANAGER">Manager</Select.Item>
                    <Select.Item value="DEVELOPER">Developer</Select.Item>
                    <Select.Item value="QA">QA / Tester</Select.Item>
                    <Select.Item value="VIEWER">Viewer</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              {/* Project Assignment */}
              {projects.length > 0 && (
                <Box>
                  <Text size="2" weight="medium">Assigned Projects</Text>
                  <Flex direction="column" gap="2" mt="2">
                    {projects.map(p => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedProjects.includes(p.id)}
                          onCheckedChange={() => toggleProject(p.id)}
                        />
                        <Text size="2">{p.name}</Text>
                      </label>
                    ))}
                  </Flex>
                </Box>
              )}

              <Separator size="4" />

              {/* Deactivate / Activate */}
              <Box>
                <Text size="2" weight="medium" as="p" mb="2">Account Status</Text>
                <Button
                  variant="soft"
                  color={user.isActive ? 'red' : 'green'}
                  onClick={toggleActive}
                  disabled={toggling}
                >
                  {toggling ? <Spinner /> : (user.isActive ? 'Deactivate User' : 'Activate User')}
                </Button>
              </Box>
            </Flex>

            <Flex gap="3" mt="5" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button color="violet" onClick={save} disabled={saving}>
                {saving ? <><Spinner /> Saving…</> : 'Save Changes'}
              </Button>
            </Flex>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
