'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Avatar, Badge, Box, Button, Card, Flex, Grid, Heading,
  Select, Table, Text, TextField
} from '@radix-ui/themes';
import {
  MagnifyingGlassIcon, PlusIcon, Pencil1Icon,
  PersonIcon, CheckCircledIcon, CrossCircledIcon
} from '@radix-ui/react-icons';
import axios from 'axios';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';

type User = {
  id: string; name: string | null; email: string | null;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'QA' | 'VIEWER';
  isActive: boolean; image: string | null; createdAt: string;
  projects: { id: number; name: string }[];
  _count: { assignedIssues: number; reportedIssues: number };
};
type Project = { id: number; name: string };

const roleColors: Record<string, 'red' | 'orange' | 'blue' | 'purple' | 'gray'> = {
  ADMIN: 'red', MANAGER: 'orange', DEVELOPER: 'blue', QA: 'purple', VIEWER: 'gray',
};
const roleLabels: Record<string, string> = {
  ADMIN: 'Admin', MANAGER: 'Manager', DEVELOPER: 'Developer', QA: 'QA', VIEWER: 'Viewer',
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <Flex direction="column" gap="1" p="1">
        <Text size="1" color="gray" weight="medium">{label}</Text>
        <Text size="6" weight="bold" className={`text-${color}-600`}>{value}</Text>
      </Flex>
    </Card>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('isActive', statusFilter === 'active' ? 'true' : 'false');
      const { data } = await axios.get<User[]>('/api/users?' + params.toString());
      setUsers(data);
    } finally { setLoading(false); }
  }, [roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => {
    axios.get<Project[]>('/api/projects').then(r => setProjects(r.data)).catch(() => {});
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const total = users.length;
  const active = users.filter(u => u.isActive).length;
  const inactive = users.filter(u => !u.isActive).length;
  const admins = users.filter(u => u.role === 'ADMIN').length;

  return (
    <Box>
      {/* Header */}
      <Flex justify="between" align="center" mb="6">
        <Box>
          <Heading size="7">User Management</Heading>
          <Text color="gray" size="2">Manage team members, roles, and project assignments.</Text>
        </Box>
        <Button color="violet" size="3" onClick={() => setCreateOpen(true)}>
          <PlusIcon /> Create User
        </Button>
      </Flex>

      {/* Stats */}
      <Grid columns={{ initial: '2', sm: '4' }} gap="4" mb="6">
        <StatCard label="Total Users" value={total} color="zinc" />
        <StatCard label="Active" value={active} color="green" />
        <StatCard label="Inactive" value={inactive} color="red" />
        <StatCard label="Admins" value={admins} color="violet" />
      </Grid>

      {/* Filters */}
      <Flex gap="3" mb="4" wrap="wrap">
        <Box style={{ flex: 1, minWidth: 200 }}>
          <TextField.Root
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          >
            <TextField.Slot><MagnifyingGlassIcon /></TextField.Slot>
          </TextField.Root>
        </Box>
        <Select.Root value={roleFilter} onValueChange={setRoleFilter}>
          <Select.Trigger placeholder="All Roles" />
          <Select.Content>
            <Select.Item value="all">All Roles</Select.Item>
            <Select.Item value="ADMIN">Admin</Select.Item>
            <Select.Item value="MANAGER">Manager</Select.Item>
            <Select.Item value="DEVELOPER">Developer</Select.Item>
            <Select.Item value="QA">QA</Select.Item>
            <Select.Item value="VIEWER">Viewer</Select.Item>
          </Select.Content>
        </Select.Root>
        <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger placeholder="All Status" />
          <Select.Content>
            <Select.Item value="all">All Status</Select.Item>
            <Select.Item value="active">Active</Select.Item>
            <Select.Item value="inactive">Inactive</Select.Item>
          </Select.Content>
        </Select.Root>
      </Flex>

      {/* Table */}
      <Card>
        {loading ? (
          <Flex align="center" justify="center" p="8">
            <Text color="gray">Loading users…</Text>
          </Flex>
        ) : filtered.length === 0 ? (
          <Flex align="center" justify="center" direction="column" gap="2" p="8">
            <PersonIcon width="32" height="32" className="text-gray-300" />
            <Text color="gray">No users found.</Text>
          </Flex>
        ) : (
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Projects</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Issues</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.map(user => {
                const initials = (user.name || user.email || '?')
                  .split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <Table.Row key={user.id} align="center">
                    <Table.Cell>
                      <Flex align="center" gap="2">
                        <Avatar
                          src={user.image ?? undefined}
                          fallback={initials}
                          size="2"
                          radius="full"
                          color={roleColors[user.role]}
                        />
                        <Box>
                          <Text as="p" size="2" weight="medium">{user.name || '—'}</Text>
                          <Text as="p" size="1" color="gray">{user.email}</Text>
                        </Box>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex align="center" gap="1">
                        {user.isActive
                          ? <><CheckCircledIcon className="text-green-600" /><Badge color="green">Active</Badge></>
                          : <><CrossCircledIcon className="text-red-500" /><Badge color="red">Inactive</Badge></>
                        }
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{user.projects.length > 0 ? user.projects.map(p => p.name).join(', ') : <Text color="gray">None</Text>}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{user._count.assignedIssues} assigned</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2" color="gray">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        size="1"
                        variant="soft"
                        color="violet"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil1Icon /> Edit
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        )}
      </Card>

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchUsers}
      />
      <EditUserDialog
        user={editingUser}
        projects={projects}
        onClose={() => setEditingUser(null)}
        onUpdated={fetchUsers}
      />
    </Box>
  );
}
