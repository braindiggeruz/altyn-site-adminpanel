import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SEOSuggestion {
  title: string;
  metaDescription: string;
  h1: string;
  keywords: string[];
  contentSuggestions: string[];
}

/**
 * Generate SEO suggestions for an article using OpenAI
 */
export async function generateSEOSuggestions(
  topic: string,
  targetKeyword: string,
  currentContent?: string
): Promise<SEOSuggestion> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const prompt = `You are an expert SEO specialist. Generate SEO suggestions for an article about "${topic}" with target keyword "${targetKeyword}".

${currentContent ? `Current content:\n${currentContent}\n` : ''}

Please provide a JSON response with the following structure:
{
  "title": "SEO-optimized title (50-60 characters)",
  "metaDescription": "Meta description (150-160 characters)",
  "h1": "H1 heading that includes the target keyword",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "contentSuggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Ensure:
1. Title includes the target keyword naturally
2. Meta description is compelling and includes the keyword
3. H1 is unique and keyword-focused
4. Keywords are semantically related to the target keyword
5. Content suggestions are actionable and SEO-focused`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]) as SEOSuggestion;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    throw new Error('Failed to parse SEO suggestions');
  }
}

/**
 * Generate article outline using OpenAI
 */
export async function generateArticleOutline(
  topic: string,
  targetKeyword: string,
  wordCount: number = 2000
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const prompt = `You are an expert content writer. Create a detailed outline for an article about "${topic}" with target keyword "${targetKeyword}" and approximately ${wordCount} words.

Return a JSON array of section titles and key points:
[
  "Introduction - Hook about the topic",
  "What is [topic]?",
  "Benefits of [topic]",
  "How to [topic]",
  "Common mistakes",
  "Best practices",
  "Conclusion"
]

Make sure each section naturally includes the target keyword or related keywords.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    return JSON.parse(jsonMatch[0]) as string[];
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    throw new Error('Failed to parse article outline');
  }
}

/**
 * Improve article content using OpenAI
 */
export async function improveArticleContent(
  content: string,
  focusArea: 'readability' | 'seo' | 'engagement' = 'seo'
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const focusPrompts = {
    readability: 'Improve readability by using shorter sentences, clearer language, and better structure.',
    seo: 'Optimize for SEO by naturally incorporating keywords, improving keyword density, and adding relevant sections.',
    engagement: 'Increase engagement by adding compelling examples, statistics, and call-to-actions.',
  };

  const prompt = `You are an expert content editor. Improve the following article content with focus on ${focusArea}:

${focusPrompts[focusArea]}

Original content:
${content}

Please provide the improved version of the content, maintaining the original meaning and structure while making the requested improvements.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const improvedContent = response.choices[0]?.message?.content;
  if (!improvedContent) {
    throw new Error('No response from OpenAI');
  }

  return improvedContent;
}

/**
 * Generate meta description using OpenAI
 */
export async function generateMetaDescription(
  title: string,
  content: string,
  keyword: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const prompt = `You are an expert SEO specialist. Generate a compelling meta description for the following article:

Title: ${title}
Target Keyword: ${keyword}
Content excerpt: ${content.substring(0, 500)}

Requirements:
1. Length: 150-160 characters
2. Include the target keyword naturally
3. Be compelling and encourage clicks
4. Accurately summarize the content

Return only the meta description, nothing else.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  const metaDescription = response.choices[0]?.message?.content?.trim();
  if (!metaDescription) {
    throw new Error('No response from OpenAI');
  }

  return metaDescription;
}

/**
 * Analyze article for SEO issues
 */
export async function analyzeSEOIssues(
  title: string,
  h1: string,
  metaDescription: string,
  content: string,
  targetKeyword: string
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const prompt = `You are an expert SEO auditor. Analyze the following article for SEO issues and provide specific recommendations:

Title: ${title}
H1: ${h1}
Meta Description: ${metaDescription}
Target Keyword: ${targetKeyword}
Content: ${content.substring(0, 1000)}

Return a JSON array of issues and recommendations:
[
  "Issue 1: Description and recommendation",
  "Issue 2: Description and recommendation"
]

Focus on:
1. Keyword optimization
2. Title and H1 optimization
3. Meta description quality
4. Content structure
5. Readability`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content_response = response.choices[0]?.message?.content;
  if (!content_response) {
    throw new Error('No response from OpenAI');
  }

  try {
    // Extract JSON from response
    const jsonMatch = content_response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    return JSON.parse(jsonMatch[0]) as string[];
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    throw new Error('Failed to parse SEO analysis');
  }
}
