// backend/utils/webSearchAgent.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Web Search Agent for Animal Health Information
 * Integrates multiple FREE search sources:
 * 1. DuckDuckGo Instant Answer API (no key needed)
 * 2. Wikipedia API (no key needed)
 * 3. SearXNG (self-hosted or public instances)
 * 4. PubMed/NCBI for veterinary research (no key needed)
 */

/**
 * Search DuckDuckGo for quick answers
 */
async function searchDuckDuckGo(query) {
  try {
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: 1,
        skip_disambig: 1
      },
      timeout: 10000
    });

    const data = response.data;
    const results = {
      abstract: data.Abstract || '',
      abstractSource: data.AbstractSource || '',
      abstractURL: data.AbstractURL || '',
      relatedTopics: data.RelatedTopics?.slice(0, 5).map(topic => ({
        text: topic.Text || '',
        url: topic.FirstURL || ''
      })) || [],
      definition: data.Definition || '',
      definitionSource: data.DefinitionSource || ''
    };

    return results;
  } catch (error) {
    console.error('DuckDuckGo search error:', error.message);
    return null;
  }
}

/**
 * Search Wikipedia for veterinary information
 */
async function searchWikipedia(query) {
  try {
    // First, search for relevant articles
    const searchResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'opensearch',
        search: query,
        limit: 3,
        namespace: 0,
        format: 'json'
      },
      timeout: 10000
    });

    const [, titles, , urls] = searchResponse.data;
    
    if (titles.length === 0) return null;

    // Get extract from the first article
    const extractResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        prop: 'extracts',
        exintro: true,
        explaintext: true,
        titles: titles[0],
        format: 'json'
      },
      timeout: 10000
    });

    const pages = extractResponse.data.query?.pages;
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId]?.extract || '';

    return {
      title: titles[0],
      extract: extract.substring(0, 1000), // Limit length
      url: urls[0],
      relatedArticles: titles.slice(1).map((title, idx) => ({
        title,
        url: urls[idx + 1]
      }))
    };
  } catch (error) {
    console.error('Wikipedia search error:', error.message);
    return null;
  }
}

/**
 * Search PubMed for veterinary research articles
 */
async function searchPubMed(query) {
  try {
    // Search for article IDs
    const searchResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
      params: {
        db: 'pubmed',
        term: query + ' AND (veterinary OR animal)',
        retmax: 3,
        retmode: 'json'
      },
      timeout: 10000
    });

    const ids = searchResponse.data.esearchresult?.idlist || [];
    if (ids.length === 0) return null;

    // Fetch summaries for the articles
    const summaryResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi', {
      params: {
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'json'
      },
      timeout: 10000
    });

    const results = ids.map(id => {
      const article = summaryResponse.data.result?.[id];
      return article ? {
        title: article.title || '',
        authors: article.authors?.slice(0, 3).map(a => a.name).join(', ') || '',
        source: article.source || '',
        pubdate: article.pubdate || '',
        pmid: id,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      } : null;
    }).filter(Boolean);

    return results;
  } catch (error) {
    console.error('PubMed search error:', error.message);
    return null;
  }
}

/**
 * Search SearXNG metasearch engine (aggregates multiple sources)
 */
async function searchSearXNG(query) {
  try {
    // Using public SearXNG instance
    const instance = process.env.SEARXNG_INSTANCE || 'https://searx.be';
    
    const response = await axios.get(`${instance}/search`, {
      params: {
        q: query + ' veterinary animal health',
        format: 'json',
        categories: 'science',
        language: 'en'
      },
      timeout: 10000
    });

    const results = response.data.results?.slice(0, 5).map(result => ({
      title: result.title || '',
      content: result.content || '',
      url: result.url || '',
      engine: result.engine || ''
    })) || [];

    return results;
  } catch (error) {
    console.error('SearXNG search error:', error.message);
    return null;
  }
}

/**
 * Main comprehensive search function
 * Searches multiple sources and aggregates results
 */
export async function searchVeterinaryInfo(query) {
  console.log(`🔍 Searching web for: "${query}"`);

  // Search all sources in parallel
  const [duckduckgo, wikipedia, pubmed, searxng] = await Promise.all([
    searchDuckDuckGo(query),
    searchWikipedia(query),
    searchPubMed(query),
    searchSearXNG(query)
  ]);

  // Aggregate results
  const aggregated = {
    query: query,
    sources: {
      duckduckgo: duckduckgo,
      wikipedia: wikipedia,
      pubmed: pubmed,
      searxng: searxng
    },
    summary: buildSummary(duckduckgo, wikipedia, pubmed, searxng),
    hasResults: !!(duckduckgo || wikipedia || pubmed || searxng)
  };

  console.log(`✅ Search complete. Found results: ${aggregated.hasResults}`);
  return aggregated;
}

/**
 * Build a text summary from all search results
 */
function buildSummary(duckduckgo, wikipedia, pubmed, searxng) {
  let summary = '';

  // DuckDuckGo abstract
  if (duckduckgo?.abstract) {
    summary += `**Quick Answer** (${duckduckgo.abstractSource}):\n${duckduckgo.abstract}\n\n`;
  }

  // Wikipedia extract
  if (wikipedia?.extract) {
    summary += `**Encyclopedia** (Wikipedia):\n${wikipedia.extract}\n\n`;
    if (wikipedia.url) {
      summary += `Read more: ${wikipedia.url}\n\n`;
    }
  }

  // Research articles
  if (pubmed && pubmed.length > 0) {
    summary += `**Recent Research** (PubMed):\n`;
    pubmed.forEach((article, idx) => {
      summary += `${idx + 1}. ${article.title} (${article.pubdate})\n`;
      summary += `   Authors: ${article.authors}\n`;
      summary += `   ${article.url}\n`;
    });
    summary += '\n';
  }

  // Web results
  if (searxng && searxng.length > 0) {
    summary += `**Additional Resources**:\n`;
    searxng.slice(0, 3).forEach((result, idx) => {
      summary += `${idx + 1}. ${result.title}\n`;
      if (result.content) {
        summary += `   ${result.content.substring(0, 150)}...\n`;
      }
      summary += `   ${result.url}\n`;
    });
  }

  return summary.trim() || 'No comprehensive summary available from web sources.';
}

/**
 * Quick search for specific veterinary topics
 */
export async function quickVetSearch(topic) {
  const queries = {
    symptoms: `${topic} symptoms in animals veterinary`,
    treatment: `${topic} treatment veterinary protocol`,
    diagnosis: `${topic} diagnosis veterinary examination`,
    prevention: `${topic} prevention control veterinary`,
    zoonotic: `${topic} zoonotic risk humans transmission`
  };

  // Search multiple angles in parallel
  const results = await Promise.all(
    Object.entries(queries).map(async ([type, query]) => {
      const searchResults = await searchVeterinaryInfo(query);
      return { type, results: searchResults };
    })
  );

  return results;
}

/**
 * Search for drug/medication information
 */
export async function searchDrugInfo(drugName) {
  const queries = [
    `${drugName} veterinary dosage`,
    `${drugName} animal drug interactions`,
    `${drugName} withdrawal period livestock`
  ];

  const results = await Promise.all(
    queries.map(query => searchVeterinaryInfo(query))
  );

  return {
    drug: drugName,
    dosage: results[0],
    interactions: results[1],
    withdrawal: results[2]
  };
}

/**
 * Check if query seems to need web search
 */
export function needsWebSearch(query) {
  const webSearchIndicators = [
    'latest', 'recent', 'new', 'current', 'update',
    'research', 'study', 'studies', 'paper',
    'what is', 'how to', 'why does', 'when to',
    'best practice', 'guideline', 'recommendation',
    'prevalence', 'statistics', 'data',
    'compare', 'difference between', 'vs',
    'alternative', 'option', 'other'
  ];

  const lowerQuery = query.toLowerCase();
  return webSearchIndicators.some(indicator => lowerQuery.includes(indicator));
}

export default {
  searchVeterinaryInfo,
  quickVetSearch,
  searchDrugInfo,
  needsWebSearch
};
