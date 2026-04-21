'use client';

import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Callout, Checkbox, Dialog, Flex, Separator, Text, TextArea, TextField } from '@radix-ui/themes';
import axios from 'axios';
import { Spinner } from '@/app/component';

type Member = { id: string; name: string | null; email: string | null; image: string | null; role: string };
type Project = { id: number; name: string; description: string | null; members: Member[] };

interface Props {
  project: Project | null;
  allUsers: Member[];
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditProjectDialog({ project, allUsers, onClose, onUpdated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setMemberIds(project.members.map(m => m.id));
      setError('');
    }
  }, [project]);

  const toggleMember = (id: string) =>
    setMemberIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const save = async () => {
    if (!project || !name.trim()) return;
    setSaving(true);
    try {
      await axios.patch(`/api/projects/${project.id}`, { name, description, memberIds });
      onUpdated(); onClose();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save changes.');
    } finally { setSaving(false); }
  };

  return (
    <Dialog.Root open={!!project} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Content maxWidth="500px">
        <Dialog.Title>Edit Project</Dialog.Title>
        {error && <Callout.Root color="red" mb="3"><Callout.Text>{error}</Callout.Text></Callout.Root>}
        {project && (
          <Flex direction="column" gap="4">
            <Box>
              <Text as="label" size="2" weight="medium">Project Name</Text>
              <TextField.Root mt="1" value={name} onChange={e => setName(e.target.value)} />
            </Box>
            <Box>
              <Text as="label" size="2" weight="medium">Description</Text>
              <TextArea mt="1" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </Box>
            {allUsers.length > 0 && (
              <Box>
                <Text size="2" weight="medium" as="p" mb="2">Team Members</Text>
                <Separator size="4" mb="2" />
                <Flex direction="column" gap="2" style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {allUsers.map(u => {
                    const initials = (u.name || u.email || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    return (
                      <label key={u.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
                        <Checkbox checked={memberIds.includes(u.id)} onCheckedChange={() => toggleMember(u.id)} />
                        <Avatar size="1" fallback={initials} radius="full" color="violet" />
                        <Box>
                          <Text size="2" weight="medium">{u.name}</Text>
                          <Text size="1" color="gray"> · {u.role}</Text>
                        </Box>
                      </label>
                    );
                  })}
                </Flex>
              </Box>
            )}
            <Flex gap="3" mt="2" justify="end">
              <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
              <Button color="violet" onClick={save} disabled={saving || !name.trim()}>
                {saving ? <><Spinner /> Saving…</> : 'Save Changes'}
              </Button>
            </Flex>
          </Flex>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
