'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaArrowLeft } from "react-icons/fa";
import slugify from "react-slugify";
import MarkdownEditor from "@uiw/react-markdown-editor";
import Image from "next/image";
import { createPost, uploadImage, checkWriteServiceHealth, getAllAuthors } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Author {
  id: number;
  name: string;
  email: string | null;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  avatar: string | null;
  blogs: any[];
  localizations: any[];
}

export default function WritePage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [markdownContent, setMarkdownContent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        console.log('=== Write Page: fetchAuthors ===');
        console.log('1. Starting to fetch authors...');
        console.log('2. Environment check:', {
          NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL,
          hasApiToken: !!process.env.STRAPI_API_TOKEN,
          tokenLength: process.env.STRAPI_API_TOKEN?.length
        });

        const authorsData = await getAllAuthors();
        console.log('3. Received authors data:', {
          hasData: !!authorsData,
          isArray: Array.isArray(authorsData),
          length: authorsData?.length,
          firstAuthor: authorsData?.[0]
        });
        
        if (!authorsData || authorsData.length === 0) {
          console.log('4. No authors found in response');
          toast.error('No authors found. Please create an author in Strapi first.');
          return;
        }

        console.log('5. Processing authors data:', {
          count: authorsData.length,
          firstAuthor: authorsData[0],
          allAuthors: authorsData
        });

        setAuthors(authorsData);
        setSelectedAuthorId(authorsData[0].id);
        console.log('6. Authors state updated:', {
          authorsCount: authorsData.length,
          selectedAuthorId: authorsData[0].id
        });
      } catch (err) {
        console.error('7. Error in fetchAuthors:', err);
        toast.error('Failed to load authors. Please try again later.');
      }
    };

    fetchAuthors();
  }, []);

  useEffect(() => {
    const checkService = async () => {
      try {
        const isHealthy = await checkWriteServiceHealth();
        setIsServiceAvailable(isHealthy);
        if (!isHealthy) {
          setError('Write service is currently unavailable. Please try again later.');
        }
      } catch (err) {
        console.error('Error checking write service:', err);
        setIsServiceAvailable(false);
        setError('Unable to connect to write service. Please try again later.');
      }
    };

    checkService();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login...');
      router.push(`/${lang}/login`);
    }
  }, [isAuthenticated, router, lang]);

  if (!isAuthenticated) {
    return null;
  }

  if (isServiceAvailable === null) {
    return (
      <div className="max-w-screen-md mx-auto p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Checking service availability...</h2>
          <p className="text-gray-500">Please wait while we verify the write service.</p>
        </div>
      </div>
    );
  }

  if (!isServiceAvailable) {
    return (
      <div className="max-w-screen-md mx-auto p-4">
        <button
          onClick={() => router.back()}
          className="text-purple-400 hover:text-purple-500 mb-6 flex items-center space-x-2"
        >
          <FaArrowLeft /> <span>Back</span>
        </button>
        <div className="bg-red-600 text-white p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Service Unavailable</h2>
          <p>{error || 'The write service is currently unavailable. Please try again later.'}</p>
        </div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setCoverImage(selectedImage);
      setImagePreview(URL.createObjectURL(selectedImage));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!selectedAuthorId) {
        throw new Error('Please select an author');
      }

      // Create slug from the title
      const postSlug = slugify(title);
      // Create the post initially without the image
      const postData = {
        title,
        description,
        slug: postSlug,
        content: markdownContent,
        author: selectedAuthorId,
      };

      console.log('Submitting post data:', postData);

      // Step 1: Create the blog post without the cover image
      const postResponse = await createPost(postData);
      console.log('Post creation response:', postResponse);
      const postId = postResponse.id;
      console.log('Post created with ID:', postId);

      // Step 2: Upload cover image (if provided) and associate with blog post
      if (coverImage) {
        console.log('Uploading cover image...');
        const uploadedImage = await uploadImage(coverImage, postId);
        console.log("Image uploaded:", uploadedImage);
      }

      // Redirect after successful post creation with language parameter
      console.log(`Redirecting to /${lang}/blogs/${postSlug}`);
      router.push(`/${lang}/blogs/${postSlug}`);
      toast.success("Post created successfully");
    } catch (error) {
      console.error("Failed to create post:", error);
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError("Failed to create post. Please try again.");
        toast.error("Failed to create post. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-screen-md mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="text-purple-400 hover:text-purple-500 mb-6 flex items-center space-x-2"
      >
        <FaArrowLeft /> <span>Back</span>
      </button>
      <h1 className="text-xl font-bold mb-4 text-gray-100 font-jet-brains">
        Create New Post
      </h1>
      {error && (
        <div className="mb-4 p-3 bg-red-600 text-white rounded-md">{error}</div>
      )}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter a Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 font-jet-brains text-3xl font-semibold bg-[#161b22] text-gray-100 border-b border-gray-600 focus:border-purple-500 focus:outline-none placeholder-gray-400"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 font-jet-brains bg-[#161b22] font-semibold text-gray-100 border-b border-gray-600 focus:border-purple-500 focus:outline-none placeholder-gray-400"
        />
        <div className="mb-4">
          <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-2">
            Select Author
          </label>
          <select
            id="author"
            value={selectedAuthorId || ''}
            onChange={(e) => setSelectedAuthorId(Number(e.target.value))}
            className="w-full p-2 bg-[#161b22] text-gray-100 border border-gray-600 rounded-md focus:border-purple-500 focus:outline-none"
          >
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full bg-[#161b22] text-gray-100"
          />
          {imagePreview && (
            <div className="mt-4">
              <Image
                src={imagePreview}
                alt="Selected Cover"
                width={100}
                height={100}
                className="w-full h-auto rounded-md"
              />
            </div>
          )}
        </div>
        <div className="mb-6">
          <MarkdownEditor
            value={markdownContent}
            height="200px"
            onChange={(value) => setMarkdownContent(value)}
            className="bg-[#161b22] text-gray-100"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !title || !description || !selectedAuthorId}
          className="bg-purple-600 text-gray-100 py-2 px-4 rounded-md hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating post..." : "Post"}
        </button>
      </div>
    </div>
  );
}