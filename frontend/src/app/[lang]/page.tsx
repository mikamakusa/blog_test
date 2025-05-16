import { Locale } from '@/i18n/settings'
import { fetchFromStrapi } from '@/utils/api'
import { Metadata } from 'next'

interface PageProps {
  params: { lang: Locale }
}

interface BlogPost {
  data: Array<{
    id: number
    documentId: string
    title: string
    description: string
    content: string | null
    slug: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    locale: string
    cover: any | null
    localizations: any[]
  }>
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export const metadata: Metadata = {
  title: 'Welcome to our Multilingual Blog',
}

export const revalidate = 0 // Disable cache during debugging

export default async function Home(props: PageProps) {
  const { lang } = await Promise.resolve(props.params)

  try {
    console.log('DEBUG - Starting to fetch blog posts for language:', lang)
    // Use the correct collection endpoint for Strapi v4
    const content = await fetchFromStrapi<BlogPost>('/blogs', lang)
    
    // Add more detailed debugging
    console.log('DEBUG - Full content structure:', JSON.stringify(content, null, 2))

    // Early return with debugging info if no content
    if (!content) {
      return (
        <div className="space-y-4">
          <h1 className="text-blue-950 text-3xl font-bold">Welcome to our multilingual blog</h1>
          <div className="text-gray-600">Current language: {lang.toUpperCase()}</div>
          <p className="text-amber-500">No response from Strapi</p>
          <div className="text-sm bg-gray-100 p-4 rounded">
            <p>Debugging info:</p>
            <pre>No content returned from API</pre>
          </div>
        </div>
      )
    }

    // Early return with debugging if no data array
    if (!content.data || !Array.isArray(content.data)) {
      return (
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Welcome to our multilingual blog</h1>
          <div className="text-gray-600">Current language: {lang.toUpperCase()}</div>
          <p className="text-amber-500">Invalid data structure received</p>
          <div className="text-sm bg-gray-100 p-4 rounded">
            <p>Debugging info:</p>
            <pre>{JSON.stringify(content, null, 2)}</pre>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Bienvenue dans mon univers</h1>
        <div className="text-gray-600">Current language: {lang.toUpperCase()}</div>
        
        {content.data.length > 0 ? (
          <div className="grid gap-6">
            {content.data.map((post) => {
              console.log('DEBUG - Rendering post:', post) // Debug individual post data
              return (
                <article key={post.id} className="p-6 bg-gray-800 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
                  <p className="text-gray-400 mb-4">{post.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      {post.publishedAt 
                        ? `Published: ${new Date(post.publishedAt).toLocaleDateString()}`
                        : 'Publication date not available'
                      }
                    </span>
                    <a href={`/${lang}/blogs/${post.slug}`} className="text-blue-500 hover:underline">
                      Read more
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="text-gray-500 space-y-4">
            <p>No blog posts available in {lang}.</p>
            <p className="text-sm">Make sure you have:</p>
            <ul className="list-disc list-inside text-sm">
              <li>Created blog posts in Strapi</li>
              <li>Published the posts</li>
              <li>Added translations for {lang}</li>
            </ul>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('DEBUG - Error in Home page:', error)
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Welcome to our multilingual blog</h1>
        <div className="text-gray-600">Current language: {lang.toUpperCase()}</div>
        <p className="text-red-500">Unable to load blog posts at this time.</p>
        <div className="text-sm bg-gray-100 p-4 rounded">
          <p>Error details:</p>
          <pre>{error instanceof Error ? error.stack : 'Unknown error'}</pre>
        </div>
      </div>
    )
  }
} 