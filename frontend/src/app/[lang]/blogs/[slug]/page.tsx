'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa';
import { getPostBySlug } from '@/lib/api';

interface Post {
  id: number;
  title: string;
  description: string;
  content: string;
  slug: string;
  coverImage?: {
    url: string;
  };
}

export default function BlogPost({
  params: { lang, slug },
}: {
  params: { lang: string; slug: string };
}) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getPostBySlug(slug);
        setPost(data);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className="text-center p-4 text-red-500">
        {error || 'Post not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="text-purple-400 hover:text-purple-500 mb-6 flex items-center space-x-2"
      >
        <FaArrowLeft /> <span>Back</span>
      </button>
      
      {post.coverImage && (
        <div className="mb-6">
          <Image
            src={post.coverImage.url}
            alt={post.title}
            width={1200}
            height={600}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-xl text-gray-600 mb-8">{post.description}</p>
      
      <div className="prose prose-lg max-w-none">
        {post.content}
      </div>
    </div>
  );
} 