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
      <Flex justify="between" align="center" mb="9">
        <Box>
          <Text className="text-hero block mb-1">Projects</Text>
          <Text color="gray" size="4" weight="medium">Organize your workspace and manage team access.</Text>
        </Box>
        {canManage(userRole) && (
          <Button color="violet" size="3" onClick={() => setCreateOpen(true)}>
            <PlusIcon width="18" height="18" /> New Project
          </Button>
        )}
      </Flex>

      {loading ? (
        <Text color="gray">Loading projects…</Text>
      ) : projects.length === 0 ? (
        <Card className="card-premium">
          <Flex direction="column" align="center" gap="4" p="9">
            <PersonIcon width={60} height={60} className="text-gray-300" />
            <Text color="gray" size="4">No projects yet. {canManage(userRole) && 'Create your first one!'}</Text>
          </Flex>
        </Card>
      ) : (
        <Grid columns={{ initial: '1', md: '2', xl: '3' }} gap="8">
          {projects.map(project => {
            const visibleMembers = project.members.slice(0, 4);
            const overflow = project.members.length - 4;
            return (
              <Card key={project.id} className="card-premium">
                <Flex direction="column" gap="5">
                  <Box>
                    <Text as="p" size="6" weight="bold" className="truncate tracking-tight mb-2">{project.name}</Text>
                    <Text as="p" size="3" color="gray" className="line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </Text>
                  </Box>

                  <Flex align="center" justify="between" mt="auto">
                    <Flex align="center" gap="1">
                      {visibleMembers.map(m => {
                        const initials = (m.name || m.email || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        return <Avatar key={m.id} src={m.image ?? undefined} fallback={initials} size="2" radius="full" color="violet" />;
                      })}
                      {overflow > 0 && <Text size="2" color="gray" ml="2" weight="medium">+{overflow}</Text>}
                      {project.members.length === 0 && <Text size="2" color="gray" className="italic">Unassigned</Text>}
                    </Flex>
                    <Badge color="violet" variant="soft" radius="full" size="3">
                      {project._count.issues} {project._count.issues === 1 ? 'issue' : 'issues'}
                    </Badge>
                  </Flex>

                  <Flex gap="2" pt="2" className="border-t border-gray-100">
                    <Button size="2" variant="surface" color="violet" asChild className="flex-1">
                      <Link href={`/projects/${project.id}`}><ExternalLinkIcon /> View Details</Link>
                    </Button>
                    {canManage(userRole) && (
                      <Button size="2" variant="soft" color="gray" onClick={() => setEditingProject(project)}>
                        <Pencil1Icon />
                      </Button>
                    )}
                    {userRole === 'ADMIN' && (
                      <Button size="2" variant="soft" color="red" onClick={() => { setDeletingId(project.id); setDeleteError(''); }}>
                        <TrashIcon />
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
