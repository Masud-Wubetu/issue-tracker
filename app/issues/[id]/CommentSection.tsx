'use client';

import { Avatar, Box, Button, Card, Flex, Heading, Text, TextArea, DropdownMenu, IconButton } from '@radix-ui/themes';
import axios from 'axios';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Spinner } from '@/app/component';
import { useSession } from 'next-auth/react';
import { DotsVerticalIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
};

interface Props {
  issueId: number;
}

const CommentSection = ({ issueId }: Props) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const currentUserId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    fetchComments();
  }, [issueId]);

  const fetchComments = async () => {
    try {
      const { data } = await axios.get<Comment[]>(`/api/issues/${issueId}/comments`);
      setComments(data);
    } catch {
      toast.error('Could not load comments.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post<Comment>(`/api/issues/${issueId}/comments`, {
        content,
      });
      setComments([data, ...comments]);
      setContent('');
      toast.success('Comment added!');
    } catch {
      toast.error('Could not post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdate = async (id: number) => {
    if (!editContent.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.patch<Comment>(`/api/comments/${id}`, {
        content: editContent,
      });
      setComments(comments.map(c => c.id === id ? data : c));
      setEditingId(null);
      toast.success('Comment updated!');
    } catch {
      toast.error('Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axios.delete(`/api/comments/${id}`);
      setComments(comments.filter(c => c.id !== id));
      toast.success('Comment deleted.');
    } catch {
      toast.error('Deletion failed.');
    }
  };

  const highlightMentions = (text: string) => {
    return text.replace(/@(\w+)/g, (match) => `**${match}**`);
  };

  if (isLoading) return <Box mt="6"><Spinner /></Box>;

  return (
    <Box mt="6">
      <Heading size="4" mb="4">Comments ({comments.length})</Heading>
      
      {session && (
        <Box mb="6">
          <TextArea
            placeholder="Add a comment... (use @user to mention)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="mb-2"
          />
          <Flex justify="end">
            <Button disabled={isSubmitting || !content.trim()} onClick={onSubmit} color="violet">
              Post Comment {isSubmitting && <Spinner />}
            </Button>
          </Flex>
        </Box>
      )}

      <Flex direction="column" gap="4">
        {comments.map((comment) => {
          const initials = (comment.user.name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          const isOwner = currentUserId === comment.userId;
          const canManage = isOwner || ["ADMIN", "MANAGER"].includes(userRole);

          return (
            <Flex key={comment.id} gap="3">
              <Avatar
                src={comment.user.image || undefined}
                fallback={initials}
                radius="full"
                size="2"
                color="violet"
              />
              <Box style={{ flex: 1 }}>
                <Card variant="surface">
                  <Flex justify="between" align="start" mb="2">
                    <Flex direction="column">
                      <Flex gap="2" align="center">
                        <Text size="2" weight="bold">{comment.user.name}</Text>
                        <Text size="1" color="gray">{comment.user.role}</Text>
                      </Flex>
                      <Text size="1" color="gray">
                        {new Date(comment.createdAt).toLocaleString()}
                      </Text>
                    </Flex>

                    {session && canManage && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <IconButton variant="ghost" color="gray">
                            <DotsVerticalIcon />
                          </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          {isOwner && (
                            <DropdownMenu.Item onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}>
                              <Pencil1Icon /> Edit
                            </DropdownMenu.Item>
                          )}
                          <DropdownMenu.Item color="red" onClick={() => onDelete(comment.id)}>
                            <TrashIcon /> Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    )}
                  </Flex>

                  {editingId === comment.id ? (
                    <Box mt="2">
                      <TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="mb-2"
                      />
                      <Flex gap="2" justify="end">
                        <Button variant="soft" color="gray" onClick={() => setEditingId(null)}>Cancel</Button>
                        <Button disabled={isSubmitting} onClick={() => onUpdate(comment.id)} color="violet">
                          Save Changes {isSubmitting && <Spinner />}
                        </Button>
                      </Flex>
                    </Box>
                  ) : (
                    <Box className="prose prose-sm max-w-full">
                      <ReactMarkdown>
                        {highlightMentions(comment.content)}
                      </ReactMarkdown>
                    </Box>
                  )}
                </Card>
              </Box>
            </Flex>
          );
        })}
      </Flex>
      <Toaster />
    </Box>
  );
};

export default CommentSection;
