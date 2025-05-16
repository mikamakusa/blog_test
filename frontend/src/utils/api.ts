import { Locale } from '@/i18n/settings'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

export async function fetchFromStrapi<T>(
  endpoint: string,
  locale: Locale,
  options: RequestInit = {}
): Promise<T> {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  }

  try {
    const url = new URL(`${STRAPI_URL}/api${endpoint}`)
    url.searchParams.append('locale', locale)
    url.searchParams.append('populate', '*')

    console.log('DEBUG - API Call:', {
      url: url.toString(),
      options: mergedOptions,
      endpoint,
      locale
    })

    const response = await fetch(url.toString(), mergedOptions)
    console.log('DEBUG - Response status:', response.status)

    const responseData = await response.text() // Get response as text first
    console.log('DEBUG - Raw response text:', responseData)

    let data
    try {
      data = JSON.parse(responseData)
      console.log('DEBUG - Parsed response:', {
        hasData: !!data,
        dataStructure: data ? Object.keys(data) : null,
        firstItem: data?.data?.[0]
      })
    } catch (parseError) {
      console.error('DEBUG - JSON parse error:', parseError)
      throw new Error('Failed to parse response as JSON')
    }

    if (!response.ok) {
      console.error('Strapi error response:', {
        status: response.status,
        statusText: response.statusText,
        data
      })
      return {
        data: []
      } as T
    }

    return data
  } catch (error) {
    console.error('DEBUG - Fetch error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return {
      data: []
    } as T
  }
}

export const fetchTranslatedContent = async (locale: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/your-content-type?locale=${locale}`);
  const data = await response.json();
  return data;
}; 