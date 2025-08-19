// Robust JSON extraction utility
// Safely extracts the first complete JSON object from mixed text

function extractFirstJsonBlock(text) {
  // Strip markdown code fences quickly
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    try {
      JSON.parse(fenced[1].trim());
      return fenced[1].trim();
    } catch {
      // Fall through to main extraction
    }
  }

  // Find all potential JSON starts
  const starts = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{" || text[i] === "[") {
      starts.push(i);
    }
  }

  // Try each potential start with a stack-based parse
  for (const start of starts) {
    const s = text.slice(start);
    let depth = 0, inStr = false, esc = false;
    const open = s[0];
    const close = open === "{" ? "}" : "]";
    
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (inStr) {
        if (esc) { 
          esc = false; 
          continue; 
        }
        if (ch === "\\") { 
          esc = true; 
          continue; 
        }
        if (ch === "\"") inStr = false;
      } else {
        if (ch === "\"") inStr = true;
        else if (ch === open) depth++;
        else if (ch === close) {
          depth--;
          if (depth === 0) {
            const candidate = s.slice(0, i + 1);
            try {
              JSON.parse(candidate);
              return candidate;
            } catch {
              // Try next start position
            }
          }
        }
      }
    }
  }
  
  return null;
}

module.exports = { extractFirstJsonBlock };
