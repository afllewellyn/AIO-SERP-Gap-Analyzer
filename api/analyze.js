import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import OpenAI from 'openai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert SEO analyst specializing in Google AI Overview optimization. Your task is to analyze gaps between a Google AI Overview snippet and a blog article to help improve the article's chances of being referenced in future AI Overviews.

Analyze the provided AI Overview text and extracted article content, then provide specific, actionable recommendations for improving the article.

Respond ONLY with valid JSON matching this exact structure:
{
  "summary": "2-4 sentence summary of alignment between AIO and article",
  "missingTopics": ["list of missing topics/subtopics present in AIO but absent/weak in article"],
  "missingEntities": ["important entities/terms/definitions present in AIO but missing/unclear in article"],
  "recommendedSections": [
    {
      "title": "string - section heading",
      "whatToInclude": "string - what content to add",
      "whereToPlace": "string - where to place this section in the article"
    }
  ],
  "suggestedSnippets": ["3-7 extractable snippets optimized for AI summarization"],
  "priorityActions": [
    {
      "action": "string - specific action to take",
      "rationale": "string - why this action is important"
    }
  ],
  "risksAndCaveats": ["caveats about the analysis or recommendations"]
}

CRITICAL REQUIREMENTS:
- Focus on content gaps that would make the article more comprehensive and authoritative
- Suggest specific, implementable changes
- Consider how Google AI evaluates content quality and authoritativeness
- Prioritize changes that would make the article more likely to be cited in AI Overviews
- Be specific about missing information, not generic advice`;

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, aiOverviewText, citedSources, blogUrl } = req.body;

    // Validate required fields
    if (!aiOverviewText || !blogUrl) {
      return res.status(400).json({ error: 'Missing required fields: aiOverviewText and blogUrl' });
    }

    console.log('Starting gap analysis for:', blogUrl);

    // Step 1: Fetch and extract article content
    const articleContent = await extractArticleContent(blogUrl);

    if (!articleContent || articleContent.length < 100) {
      return res.status(400).json({
        error: 'Could not extract sufficient content from the article URL. Please check the URL and try again.'
      });
    }

    console.log('Extracted article content length:', articleContent.length);

    // Step 2: Analyze with AI
    const analysisResult = await analyzeWithAI(query, aiOverviewText, articleContent, citedSources);

    console.log('Gap analysis complete');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(analysisResult);

  } catch (error) {
    console.error('Analysis error:', error);

    let errorMessage = 'Analysis failed';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Could not fetch the article. Please check the URL and try again.';
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: errorMessage });
  }
}

async function extractArticleContent(url) {
  try {
    // Fetch the webpage with a reasonable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIO-Gap-Analyzer/1.0)',
      },
      redirect: 'follow',
      follow: 5,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status}`);
    }

    const html = await response.text();

    // Use Mozilla Readability to extract article content
    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      // Fallback: try to extract content manually
      const fallbackContent = extractContentFallback(doc.window.document);
      return fallbackContent;
    }

    // Clean up the extracted text
    let content = article.textContent;

    // Remove excessive whitespace
    content = content.replace(/\s+/g, ' ').trim();

    // Limit content length to avoid token limits (keep first 8000 chars for context)
    if (content.length > 8000) {
      content = content.substring(0, 8000) + '...';
    }

    return content;

  } catch (error) {
    console.error('Content extraction error:', error);
    throw new Error('Failed to extract article content');
  }
}

function extractContentFallback(document) {
  // Fallback extraction strategy
  const selectors = [
    'article',
    '[role="main"]',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-content',
    'main',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent && element.textContent.length > 200) {
      return element.textContent.replace(/\s+/g, ' ').trim().substring(0, 8000);
    }
  }

  // Last resort: get all paragraph text
  const paragraphs = document.querySelectorAll('p');
  let content = '';
  for (const p of paragraphs) {
    if (p.textContent) {
      content += p.textContent + ' ';
    }
  }

  return content.trim().substring(0, 8000);
}

async function analyzeWithAI(query, aiOverviewText, articleContent, citedSources) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API;
  const openai = new OpenAI({ apiKey });

  const userPrompt = `Please analyze the gaps between this Google AI Overview and the article content.

AI OVERVIEW TEXT:
${aiOverviewText}

ARTICLE CONTENT:
${articleContent}

${citedSources && citedSources.length > 0 ? `SOURCES CITED IN AI OVERVIEW: ${citedSources.join(', ')}` : ''}

${query ? `SEARCH QUERY: ${query}` : ''}

Compare the AI Overview content with the article and identify what's missing or could be improved in the article to make it more likely to be referenced in future AI Overviews.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Cost-effective model for this task
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const response = completion.choices[0]?.message?.content;

  if (!response) {
    throw new Error('No response from AI analysis');
  }

  // Extract JSON from the response
  let jsonStr = response;
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  try {
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    console.error('Failed to parse AI response:', response);
    throw new Error('Failed to parse analysis response');
  }
}
