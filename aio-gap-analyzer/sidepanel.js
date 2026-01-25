import{r,j as a,c as u}from"./index.js";const h=()=>{const[i,s]=r.useState(null),[n,o]=r.useState(null);r.useEffect(()=>{chrome.storage.local.get(["aioData","analysisResult"],e=>{e.aioData&&s(e.aioData),e.analysisResult&&o(e.analysisResult)});const t=e=>{if(e.aioData){const l=e.aioData.newValue;s(l??null)}if(e.analysisResult){const l=e.analysisResult.newValue;o(l??null)}};return chrome.storage.onChanged.addListener(t),()=>{chrome.storage.onChanged.removeListener(t)}},[]);const d=()=>{i?.aiOverviewText&&navigator.clipboard.writeText(i.aiOverviewText)},m=()=>{if(n){const t=`
Summary: ${n.summary}

Missing Topics:
${n.missingTopics.map(e=>`- ${e}`).join(`
`)}

Missing Entities:
${n.missingEntities.map(e=>`- ${e}`).join(`
`)}

Recommended Sections:
${n.recommendedSections.map(e=>`${e.title}: ${e.whatToInclude} (${e.whereToPlace})`).join(`
`)}

Suggested Snippets:
${n.suggestedSnippets.map(e=>`- ${e}`).join(`
`)}

Priority Actions:
${n.priorityActions.map(e=>`${e.action} (${e.rationale})`).join(`
`)}

Risks and Caveats:
${n.risksAndCaveats.map(e=>`- ${e}`).join(`
`)}
      `.trim();navigator.clipboard.writeText(t)}},p=()=>{chrome.storage.local.remove(["aioData","analysisResult"]),s(null),o(null)};return a.jsxs("div",{className:"sidepanel",children:[a.jsxs("header",{children:[a.jsx("h1",{children:"AIO Gap Analysis"}),n&&a.jsxs("div",{className:"metadata",children:[a.jsxs("div",{children:["Query: ",n.query]}),a.jsxs("div",{children:["Analyzed: ",new Date(n.timestamp).toLocaleString()]})]})]}),a.jsxs("div",{className:"content",children:[a.jsxs("div",{className:"section",children:[a.jsxs("div",{className:"section-header",children:[a.jsx("h2",{children:"AI Overview Text"}),a.jsx("button",{onClick:d,className:"copy-btn",children:"Copy AIO"})]}),a.jsx("textarea",{className:"scrollable-text",value:i?.aiOverviewText||"No AI Overview detected yet",readOnly:!0})]}),a.jsxs("div",{className:"section",children:[a.jsxs("div",{className:"section-header",children:[a.jsx("h2",{children:"Gap Analysis Recommendations"}),a.jsx("button",{onClick:m,className:"copy-btn",children:"Copy Recommendations"})]}),a.jsx("textarea",{className:"scrollable-text",value:n?x(n):"No analysis results yet. Run gap analysis from the popup.",readOnly:!0})]})]}),a.jsx("footer",{children:a.jsx("button",{onClick:p,className:"clear-btn",children:"Clear All Data"})})]})};function x(i){return`
SUMMARY:
${i.summary}

MISSING TOPICS:
${i.missingTopics.map(s=>`• ${s}`).join(`
`)}

MISSING ENTITIES:
${i.missingEntities.map(s=>`• ${s}`).join(`
`)}

RECOMMENDED SECTIONS:
${i.recommendedSections.map(s=>`• ${s.title}: ${s.whatToInclude} (Place: ${s.whereToPlace})`).join(`
`)}

SUGGESTED SNIPPETS:
${i.suggestedSnippets.map(s=>`• ${s}`).join(`
`)}

PRIORITY ACTIONS:
${i.priorityActions.map(s=>`• ${s.action} - ${s.rationale}`).join(`
`)}

RISKS AND CAVEATS:
${i.risksAndCaveats.map(s=>`• ${s}`).join(`
`)}
  `.trim()}const c=document.getElementById("sidepanel-root");c&&u.createRoot(c).render(a.jsx(h,{}));
