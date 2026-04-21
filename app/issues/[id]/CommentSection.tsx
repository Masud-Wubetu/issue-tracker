'use client';

import { Avatar, Box, Button, Card, Flex, Heading, Text, TextArea } from '@radix-ui/themes';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Spinner } from '@/app/component';

type Comment = {
  id: number;
  content: string;
  createdAt: string;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();

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

  // Simple highlighter for @mentions
  const highlightMentions = (text: string) => {
    return text.replace(/@(\w+)/g, (match, username) => {
      return `**${match}**`; // Just bolding it for now as a visual cue
    });
  };

  if (isLoading) return <Spinner />;

  return (
    <Box mt="6">
      <Heading size="4" mb="4">Comments ({comments.length})</Heading>
      
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

      <Flex direction="column" gap="4">
        {comments.map((comment) => {
          const initials = (comment.user.name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
                  <Flex justify="between" align="center" mb="2">
                    <Flex gap="2" align="center">
                      <Text size="2" weight="bold">{comment.user.name}</Text>
                      <Text size="1" color="gray">{comment.user.role}</Text>
                    </Flex>
                    <Text size="1" color="gray">
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                  </Flex>
                  <Box className="prose prose-sm max-w-full">
                    <ReactMarkdown>
                      {highlightMentions(comment.content)}
                    </ReactMarkdown>
                  </Box>
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
