// backend/controllers/chatController.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Disease from "../models/diseaseModel.js";
import { fileURLToPath } from 'url';
import { getAIResponse } from '../utils/aiAgent.js';

// Simple in-memory cache
const cache = new Map();

// Store conversation sessions (in production, use Redis or database)
const conversationSessions = new Map();

// Resolve the data JSON path robustly: try process.cwd(), parent folders, and the repository root
function resolveDataPath() {
  const candidates = [];
  const cwd = process.cwd();
  candidates.push(path.join(cwd, 'diseases_100plus.json'));
  candidates.push(path.join(cwd, '..', 'diseases_100plus.json'));
  candidates.push(path.join(cwd, '..', '..', 'diseases_100plus.json'));
  // try file location relative to this controller file
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    candidates.push(path.join(__dirname, '..', '..', 'diseases_100plus.json'));
    candidates.push(path.join(__dirname, '..', 'diseases_100plus.json'));
  } catch (e) {
    // ignore
  }

  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch (e) {
      // ignore
    }
  }
  // fallback to cwd path
  return path.join(process.cwd(), 'diseases_100plus.json');
}

function formatDisease(d) {
  let out = `🦠 **${d.name}**\n\n`;

  if (d.species?.length)
    out += `🐾 **Species Affected:**\n${d.species.map(s => `• ${s}`).join("\n")}\n\n`;

  if (d.clinical_diagnosis_and_findings?.length) {
    out += `🩺 **Clinical Diagnosis & Findings:**\n`;
    d.clinical_diagnosis_and_findings.forEach(sec => {
      out += `\n**${sec.category}:**\n`;
      sec.findings.forEach(f => (out += `• ${f}\n`));
    });
    out += `\n`;
  }

  if (d.diagnostic_tests?.length) {
    out += `🔬 **Diagnostic Tests:**\n`;
    d.diagnostic_tests.forEach(t => {
      out += `• **${t.test}** (${t.type || "unknown"}) → ${t.expected_finding || "N/A"}\n`;
    });
    out += `\n`;
  }

  if (d.treatment?.length) {
    out += `💊 **Treatment:**\n`;
    d.treatment.forEach(t => {
      out += `• ${t.modality}\n`;
      if (t.details?.length) out += t.details.map(x => `   - ${x}`).join("\n") + "\n";
      // common keys found in local JSON: target_pathogens, antibiotics, preparation_and_administration, considerations
      if (t.target_pathogens?.length) {
        out += `   - Target Pathogens:\n`;
        out += t.target_pathogens.map(p => `      • ${p}`).join("\n") + "\n";
      }
      if (t.antibiotics?.length) {
        out += `   - Antibiotics:\n`;
        out += t.antibiotics.map(a => `      • ${a}`).join("\n") + "\n";
      }
      if (t.preparation_and_administration?.length) {
        out += `   - Preparation & Administration:\n`;
        out += t.preparation_and_administration.map(step => `      • ${step}`).join("\n") + "\n";
      }
      if (t.considerations?.length) {
        out += `   - Considerations:\n`;
        out += t.considerations.map(c => `      • ${c}`).join("\n") + "\n";
      }
      // legacy nested types structure
      if (t.types?.length) {
        t.types.forEach(tp => {
          out += `   - ${tp.type}: ${tp.use || ""}\n`;
          if (tp.relevant_antibiotics)
            out += `      Antibiotics: ${tp.relevant_antibiotics.join(", ")}\n`;
          if (tp.adjunct) out += `      Adjunct: ${tp.adjunct}\n`;
        });
      }
      if (t.note) out += `   - Note: ${t.note}\n`;
    });
    out += `\n`;
  }

  if (d.prevalence_regions?.length)
    out += `🌍 **Regions Affected:** ${d.prevalence_regions.join(", ")}\n\n`;

  out += `⚠️ **Zoonotic Risk:** ${d.zoonotic_risk ? "Yes" : "No"}`;

  return out.trim();
}

// Fallback response when nothing is found in DB
function fallbackReply(query) {
  return `⚠️ Sorry, I couldn't find a disease matching "${query}".\n
Here's some general advice:
- Consult a qualified veterinarian for diagnosis.
- Observe any unusual signs in your animals: lethargy, loss of appetite, fever, abnormal discharge.
- Maintain hygiene, vaccination, and preventive care.
- Record symptoms and duration before visiting a vet.`;
}

export const chatWithAI = async (req, res) => {
  try {
    // Accept message, query, or input from frontend
    const raw = req.body.message ?? req.body.query ?? req.body.input;
    const conversationHistory = req.body.conversationHistory || [];
    const sessionId = req.body.sessionId || `session_${Date.now()}`; // Track sessions
    const useAI = req.body.useAI !== false; // Allow disabling AI for simple lookups
    const debugRequested = req.body?.debug === true || req.query?.debug === '1';
    
    const dbg = { raw, useAI, sessionId };
    
    if (!raw || !String(raw).trim()) {
      return res.status(400).json({ 
        reply: "❌ Please enter a message or question.",
        sessionId 
      });
    }

    const rawQuery = String(raw).trim();
    
    // Normalize query for database search
    function normalizeQuery(input) {
      if (!input) return '';
      let s = String(input).toLowerCase();
      s = s.replace(/[^a-z0-9\s]/g, ' ');
      s = s.replace(/\b(what|whats|what's|who|where|when|why|how|explain|define|definition|tell|tellme|tell me|tell me about|give|give me|give me info|give me information|info|information|details|show|please|could you|would you|i want|i need)\b/g, ' ');
      s = s.replace(/\b(is|are|am|do|does|did|can|could|should|would|will|the|a|an|in|on|about|for|of|to|me|my)\b/g, ' ');
      s = s.replace(/\s+/g, ' ').trim();
      if (!s) {
        const fallback = String(input).replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(w => w.length > 2).join(' ');
        return fallback || String(input).trim();
      }
      return s;
    }

    const query = normalizeQuery(rawQuery);
    if (debugRequested) {
      dbg.rawQuery = rawQuery;
      dbg.normalized = query;
    }

    // Try to find relevant disease data from database or JSON
    let diseaseData = null;
    let searchSource = null;

    // Search database if connected
    if (mongoose.connection.readyState === 1) {
      try {
        diseaseData = await Disease.findOne({
          $or: [
            { name: { $regex: query, $options: "i" } },
            { species: { $regex: query, $options: "i" } },
            { "clinical_diagnosis_and_findings.findings": { $regex: query, $options: "i" } },
            { "diagnostic_tests.test": { $regex: query, $options: "i" } },
            { "treatment.details": { $regex: query, $options: "i" } },
            { "treatment.modality": { $regex: query, $options: "i" } },
            { "treatment.antibiotics": { $regex: query, $options: "i" } }
          ]
        }).maxTimeMS(5000).lean();
        
        if (diseaseData) searchSource = 'database';
      } catch (e) {
        console.warn('DB search failed:', e?.message || e);
      }

      // Fuzzy match if no direct match
      if (!diseaseData) {
        try {
          const docs = await Disease.find({}, { name: 1, species: 1 }).lean();
          const candidates = docs.map(d => ({ id: d._id, name: d.name || '', species: (d.species || []).join(' ') }));
          const best = findBestFuzzyMatch(query, candidates, ['name', 'species']);
          if (best && best.score >= 0.65) {
            diseaseData = await Disease.findById(best.item.id).lean();
            searchSource = 'database-fuzzy';
            if (debugRequested) dbg.fuzzy = { bestName: best.item.name || best.item.id, score: best.score };
          }
        } catch (e) {
          console.warn('Fuzzy DB lookup failed:', e?.message || e);
        }
      }
    }

    // Try local JSON if no database match
    if (!diseaseData) {
      try {
        const dataPath = resolveDataPath();
        if (fs.existsSync(dataPath)) {
          const rawJson = fs.readFileSync(dataPath, 'utf8');
          const json = JSON.parse(rawJson);
          const list = (json.diseases || []).map(d => ({ item: d, name: d.name || '', species: (d.species || []).join(' ') }));
          
          // Try exact match first
          const exact = list.find(d => 
            (d.name && d.name.toLowerCase().includes(query.toLowerCase())) || 
            (d.item.treatment && d.item.treatment.some(t => (t.modality || '').toLowerCase().includes(query.toLowerCase())))
          );
          
          if (exact) {
            diseaseData = exact.item;
            searchSource = 'local-json';
            if (debugRequested) dbg.localExact = exact.name || exact.item?.name;
          } else {
            // Try fuzzy match
            const bestLocal = findBestFuzzyMatch(query, list.map(l => ({ id: null, name: l.name, species: l.species, item: l.item })), ['name', 'species']);
            if (bestLocal && bestLocal.score >= 0.65) {
              diseaseData = bestLocal.item.item || bestLocal.item;
              searchSource = 'local-json-fuzzy';
              if (debugRequested) dbg.localFuzzy = { name: bestLocal.item?.name, score: bestLocal.score };
            }
          }
        }
      } catch (e) {
        console.error('Error reading local diseases JSON:', e);
      }
    }

    // Use AI to generate conversational response
    if (useAI) {
      try {
        // Get or create conversation session
        let sessionHistory = conversationSessions.get(sessionId) || [];
        
        // Use provided history if available, otherwise use session history
        const effectiveHistory = conversationHistory.length > 0 ? conversationHistory : sessionHistory;
        
        // Generate AI response with disease context and web search
        const aiResult = await getAIResponse(
          rawQuery,
          effectiveHistory,
          diseaseData,
          1500, // Max tokens
          true  // Enable web search
        );

        // Extract response and metadata
        const aiResponse = aiResult.response || aiResult; // Handle both old and new format
        const webSearchUsed = aiResult.webSearchUsed || false;

        // Update session history
        sessionHistory.push({ role: 'user', content: rawQuery });
        sessionHistory.push({ role: 'assistant', content: aiResponse });
        
        // Keep only last 10 messages (5 exchanges)
        if (sessionHistory.length > 10) {
          sessionHistory = sessionHistory.slice(-10);
        }
        conversationSessions.set(sessionId, sessionHistory);

        // Clean up old sessions (older than 1 hour)
        cleanupOldSessions();

        return res.json({
          reply: aiResponse,
          sessionId,
          source: searchSource || 'ai-generated',
          diseaseFound: !!diseaseData,
          webSearchUsed: webSearchUsed,
          conversationHistory: sessionHistory,
          debug: debugRequested ? dbg : undefined
        });

      } catch (aiError) {
        console.error('AI Response Error:', aiError.message);
        
        // Fallback to formatted disease data if AI fails
        if (diseaseData) {
          const fallbackReply = formatDisease(diseaseData);
          return res.json({
            reply: fallbackReply + '\n\n_Note: Using fallback formatting due to AI service unavailability._',
            sessionId,
            source: searchSource,
            diseaseFound: true,
            aiError: aiError.message,
            debug: debugRequested ? dbg : undefined
          });
        }
        
        // If no disease data and AI fails, return error
        return res.status(500).json({
          reply: `⚠️ I'm having trouble generating a response right now. ${aiError.message}\n\nPlease try:\n- Using simpler, more specific questions\n- Asking about specific animal diseases\n- Trying again in a moment`,
          sessionId,
          error: aiError.message,
          debug: debugRequested ? dbg : undefined
        });
      }
    } else {
      // Legacy mode: just return formatted disease data
      const reply = diseaseData ? formatDisease(diseaseData) : fallbackReply(query);
      cache.set(query, reply);

      return res.json({ 
        reply, 
        sessionId,
        source: searchSource || "fallback", 
        disease: diseaseData || null,
        debug: debugRequested ? dbg : undefined
      });
    }
  } catch (err) {
    console.error("❌ Chat Route Error:", err);
    res.status(500).json({ 
      reply: "🚫 Server error. Please try again later.",
      error: err.message 
    });
  }
};

// Clean up conversation sessions older than 1 hour
function cleanupOldSessions() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [sessionId, _] of conversationSessions.entries()) {
    const timestamp = parseInt(sessionId.split('_')[1]);
    if (timestamp && timestamp < oneHourAgo) {
      conversationSessions.delete(sessionId);
    }
  }
}

// --- Fuzzy matching helpers ---
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  a = String(a || '').toLowerCase();
  b = String(b || '').toLowerCase();
  if (!a && !b) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

function findBestFuzzyMatch(query, candidates, fields) {
  let best = null;
  for (const c of candidates) {
    let bestFieldScore = 0;
    for (const f of fields) {
      const val = (c[f] || '').toString();
      const score = similarity(query, val);
      if (score > bestFieldScore) bestFieldScore = score;
    }
    if (!best || bestFieldScore > best.score) {
      best = { item: c.item || c, score: bestFieldScore, candidate: c };
    }
  }
  return best;
}



