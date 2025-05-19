// lib/api.ts
import axios, { AxiosInstance } from "axios";
import { UserBlogPostData } from "./types";

// Debug environment variables
console.log('=== Environment Variables Debug ===');
console.log('1. Raw environment variables:', {
    STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL,
    hasToken: !!process.env.STRAPI_API_TOKEN,
    tokenLength: process.env.STRAPI_API_TOKEN?.length,
    tokenPreview: process.env.STRAPI_API_TOKEN ?
        `${process.env.STRAPI_API_TOKEN.substring(0, 5)}...` :
        'no token'
});

const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
console.log('2. API Token check:', {
    exists: !!STRAPI_TOKEN,
    length: STRAPI_TOKEN?.length,
    firstChars: STRAPI_TOKEN?.substring(0, 5) + '...',
    fullToken: STRAPI_TOKEN // TEMPORARY: Remove this in production
});

// Create API instance with token in headers
export const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
    headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
    console.log('3. API Request Debug:', {
        url: request.url,
        method: request.method,
        headers: request.headers,
        authHeader: request.headers.Authorization,
        baseURL: request.baseURL
    });
    return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
    response => {
        console.log('4. API Response Debug:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
        return response;
    },
    error => {
        console.error('5. API Error Debug:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            config: {
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
        return Promise.reject(error);
    }
);

// Create write service API client
const writeApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_WRITE_SERVICE_URL || 'http://localhost:3002',
    withCredentials: true,
});

// Add request interceptor for debugging and authentication
writeApi.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
});

// Add response interceptor for debugging
writeApi.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('Response Error:', error.response || error);
        return Promise.reject(error);
    }
);

// Service health check
export const checkWriteServiceHealth = async (): Promise<boolean> => {
    try {
        console.log('Checking write service health at:', `${writeApi.defaults.baseURL}/api/write/health`);
        const response = await writeApi.get('/api/write/health');
        console.log('Health check response:', response.data);
        return response.data.status === 'ok';
    } catch (error) {
        console.error('Write service health check failed:', error);
        if (axios.isAxiosError(error)) {
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
        }
        return false;
    }
};

export const getAllPosts = async (
    page: number = 1,
    searchQuery: string = ""
) => {
    try {
        // If search query exists, filter posts based on title
        const searchFilter = searchQuery
            ? `&filters[title][$containsi]=${searchQuery}`
            : ""; // Search filter with the title
        // Fetch posts with pagination and populate the required fields
        const response = await api.get(
            `api/blogs?populate=*&pagination[page]=${page}&pagination[pageSize]=${process.env.NEXT_PUBLIC_PAGE_LIMIT}${searchFilter}`
        );
        return {
            posts: response.data.data,
            pagination: response.data.meta.pagination, // Return data and include pagination data
        };
    } catch (error) {
        console.error("Error fetching blogs:", error);
        throw new Error("Server error"); // Error handling
    }
};

// Get post by slug
export const getPostBySlug = async (slug: string) => {
    try {
        const response = await api.get(
            `api/blogs?filters[slug]=${slug}&populate=*`
        ); // Fetch a single blog post using the slug parameter
        if (response.data.data.length > 0) {
            // If post exists
            return response.data.data[0]; // Return the post data
        }
        throw new Error("Post not found.");
    } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Server error");
    }
};

// Get all posts categories
export const getAllCategories = async () => {
    try {
        const response = await api.get("api/categories"); // Route to fetch Categories data
        return response.data.data; // Return all categories
    } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Server error");
    }
};

// Upload image with correct structure for referencing in the blog
export const uploadImage = async (image: File, refId: number) => {
    try {
        const formData = new FormData();
        formData.append("files", image);
        formData.append("ref", "api::blog.blog"); // ref: Strapi content-type name (in this case 'blog')
        formData.append("refId", refId.toString()); // refId: Blog post ID
        formData.append("field", "cover"); // field: Image field name in the blog

        const response = await api.post("api/upload", formData); // Strapi route to upload files and images
        const uploadedImage = response.data[0];
        return uploadedImage; // Return full image metadata
    } catch (err) {
        console.error("Error uploading image:", err);
        throw err;
    }
};

export const createPost = async (postData: any) => {
    // Check service health before making the request
    const isHealthy = await checkWriteServiceHealth();
    if (!isHealthy) {
        throw new Error('Write service is currently unavailable. Please try again later.');
    }
    
    console.log('Creating post with data:', postData);
    try {
        const response = await writeApi.post('/api/write/posts', postData);
        console.log('Post creation response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating post:', error);
        if (axios.isAxiosError(error)) {
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
        }
        throw error;
    }
};

export const updatePost = async (id: string, postData: any) => {
    // Check service health before making the request
    const isHealthy = await checkWriteServiceHealth();
    if (!isHealthy) {
        throw new Error('Write service is currently unavailable. Please try again later.');
    }
    
    const response = await writeApi.put(`/api/write/posts/${id}`, postData);
    return response.data;
};

export const deletePost = async (id: string) => {
    // Check service health before making the request
    const isHealthy = await checkWriteServiceHealth();
    if (!isHealthy) {
        throw new Error('Write service is currently unavailable. Please try again later.');
    }
    
    await writeApi.delete(`/api/write/posts/${id}`);
};

// Get all authors from Strapi
export const getAllAuthors = async () => {
    try {
        console.log('=== getAllAuthors Debug ===');
        console.log('1. Request Configuration:', {
            url: 'api/authors?populate=*',
            token: STRAPI_TOKEN ? 'exists' : 'missing',
            tokenLength: STRAPI_TOKEN?.length,
            tokenPreview: STRAPI_TOKEN ? `${STRAPI_TOKEN.substring(0, 5)}...` : 'no token'
        });

        // Use the api instance which already has the token configured
        const response = await api.get('api/authors?populate=*');

        console.log('2. Response Status:', {
            status: response.status,
            statusText: response.statusText
        });

        console.log('3. Response Data:', {
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : null,
            dataStructure: response.data
        });

        if (!response.data || !response.data.data) {
            console.error('4. Invalid response format:', response.data);
            throw new Error('Invalid response format from Strapi');
        }

        console.log('5. Returning authors:', {
            count: response.data.data.length,
            firstAuthor: response.data.data[0]
        });

        return response.data.data;
    } catch (error) {
        console.error("=== getAllAuthors Error ===");
        if (axios.isAxiosError(error)) {
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                method: error.config?.method,
                requestHeaders: error.config?.headers
            });
        } else {
            console.error('Non-Axios error:', error);
        }
        throw new Error("Failed to fetch authors");
    }
};