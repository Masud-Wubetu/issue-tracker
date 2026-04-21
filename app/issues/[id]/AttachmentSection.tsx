'use client';

import { useState, useRef } from 'react';
import { Badge, Box, Button, Flex, Text } from '@radix-ui/themes';
import { UploadIcon, TrashIcon, FileIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import { Spinner } from '@/app/component';
import Image from 'next/image';

type Attachment = { id: number; filename: string; url: string; size: number | null; mimeType: string | null; uploadedAt: string };

interface Props { issueId: number; attachments: Attachment[] }

const isImage = (mime: string | null) => mime?.startsWith('image/') ?? false;
const formatSize = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function AttachmentSection({ issueId, attachments: initial }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await axios.post(`/api/issues/${issueId}/attachments`, form);
      setAttachments(prev => [...prev, data]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (id: number) => {
    try {
      await axios.delete(`/api/issues/${issueId}/attachments`, { data: { attachmentId: id } });
      setAttachments(prev => prev.filter(a => a.id !== id));
    } catch { setError('Failed to delete attachment.'); }
  };

  return (
    <Box mt="4">
      <Flex justify="between" align="center" mb="3">
        <Text size="3" weight="bold">Attachments ({attachments.length})</Text>
        <Button size="1" variant="soft" color="violet" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <><Spinner /> Uploading…</> : <><UploadIcon /> Add File</>}
        </Button>
        <input ref={inputRef} type="file" className="hidden" onChange={upload} accept="image/*,.pdf,.txt,.csv,.json,.zip,.log" />
      </Flex>

      {error && <Text color="red" size="2" as="p" mb="2">{error}</Text>}

      {attachments.length === 0 ? (
        <Text color="gray" size="2">No attachments yet.</Text>
      ) : (
        <Flex direction="column" gap="2">
          {attachments.map(a => (
            <Flex key={a.id} align="center" gap="3" className="border rounded-md p-2 hover:bg-gray-50">
              {isImage(a.mimeType) ? (
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  <div style={{ width: 48, height: 48, position: 'relative' }}>
                    <Image src={a.url} alt={a.filename} fill style={{ objectFit: 'cover' }} className="rounded" />
                  </div>
                </a>
              ) : (
                <Flex align="center" justify="center" style={{ width: 48, height: 48, background: 'var(--gray-3)', borderRadius: 6 }}>
                  <FileIcon width={24} height={24} />
                </Flex>
              )}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="hover:text-violet-600">
                  <Text size="2" weight="medium" className="truncate block">{a.filename}</Text>
                </a>
                <Flex gap="2" align="center">
                  {a.mimeType && <Badge size="1" color="gray">{a.mimeType.split('/')[1]}</Badge>}
                  <Text size="1" color="gray">{formatSize(a.size)}</Text>
                </Flex>
              </Box>
              <Button size="1" variant="ghost" color="red" onClick={() => remove(a.id)}>
                <TrashIcon />
              </Button>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
}
