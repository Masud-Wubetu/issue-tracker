'use client';

import { useCallback, useEffect, useState } from 'react';
import { Avatar, Badge, Box, Button, Card, Dialog, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { PlusIcon, Pencil1Icon, TrashIcon, ExternalLinkIcon, PersonIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import Link from 'next/link';
import CreateProjectDialog from './CreateProjectDialog';
import EditProjectDialog from './EditProjectDialog';

type Member = { id: string; name: string | null; email: string | null; image: string | null; role: string };
type Project = {
  id: number; name: string; description: string | null; createdAt: string;
  members: Member[];
  _count: { issues: number; members: number };
};

const canManage = (role: string) => ['ADMIN', 'MANAGER'].includes(role);

export default function ProjectsClient({ userRole }: { userRole: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Project[]>('/api/projects');
      setProjects(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => {
    axios.get<Member[]>('/api/users').then(r => setAllUsers(r.data)).catch(() => {});
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setDeleteError('');
      await axios.delete(`/api/projects/${id}`);
      setDeletingId(null);
      fetchProjects();
    } catch (e: any) {
      setDeleteError(e.response?.data?.error || 'Failed to delete project.');
    }
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="6">
        <Box>
          <Heading size="7">Projects</Heading>
          <Text color="gray" size="2">Manage projects and assign team members.</Text>
        </Box>
        {canManage(userRole) && (
          <Button color="violet" size="3" onClick={() => setCreateOpen(true)}>
            <PlusIcon /> New Project
          </Button>
        )}
      </Flex>

      {loading ? (
        <Text color="gray">Loading projects…</Text>
      ) : projects.length === 0 ? (
        <Card>
          <Flex direction="column" align="center" gap="3" p="8">
            <PersonIcon width={40} height={40} className="text-gray-300" />
            <Text color="gray">No projects yet. {canManage(userRole) && 'Create your first one!'}</Text>
          </Flex>
        </Card>
      ) : (
        <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
          {projects.map(project => {
            const visibleMembers = project.members.slice(0, 4);
            const overflow = project.members.length - 4;
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <Flex direction="column" gap="3" p="1">
                  <Flex justify="between" align="start">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text as="p" size="4" weight="bold" className="truncate">{project.name}</Text>
                      <Text as="p" size="2" color="gray" className="line-clamp-2 mt-1">
                        {project.description || 'No description provided.'}
                      </Text>
                    </Box>
                    <Badge color="violet" ml="2">{project._count.issues} issues</Badge>
                  </Flex>

                  {/* Members */}
                  <Flex align="center" gap="1">
                    {visibleMembers.map(m => {
                      const initials = (m.name || m.email || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                      return <Avatar key={m.id} src={m.image ?? undefined} fallback={initials} size="1" radius="full" color="violet" />;
                    })}
                    {overflow > 0 && <Text size="1" color="gray" ml="1">+{overflow}</Text>}
                    {project.members.length === 0 && <Text size="1" color="gray">No members assigned</Text>}
                  </Flex>

                  <Flex gap="2" mt="1">
                    <Button size="1" variant="soft" color="violet" asChild>
                      <Link href={`/projects/${project.id}`}><ExternalLinkIcon /> View</Link>
                    </Button>
                    {canManage(userRole) && (
                      <Button size="1" variant="soft" color="gray" onClick={() => setEditingProject(project)}>
                        <Pencil1Icon /> Edit
                      </Button>
                    )}
                    {userRole === 'ADMIN' && (
                      <Button size="1" variant="soft" color="red" onClick={() => { setDeletingId(project.id); setDeleteError(''); }}>
                        <TrashIcon /> Delete
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Grid>
      )}

      {/* Delete Confirmation */}
      <Dialog.Root open={deletingId !== null} onOpenChange={(o) => { if (!o) { setDeletingId(null); setDeleteError(''); } }}>
        <Dialog.Content maxWidth="400px">
          <Dialog.Title>Delete Project</Dialog.Title>
          <Dialog.Description color="gray" size="2" mb="4">
            This action is permanent. The project will be deleted only if it has no issues.
          </Dialog.Description>
          {deleteError && <Text color="red" size="2" as="p" mb="3">{deleteError}</Text>}
          <Flex gap="3" justify="end">
            <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
            <Button color="red" onClick={() => deletingId && handleDelete(deletingId)}>Confirm Delete</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <CreateProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchProjects} />
      <EditProjectDialog project={editingProject} allUsers={allUsers} onClose={() => setEditingProject(null)} onUpdated={fetchProjects} />
    </Box>
  );
}
