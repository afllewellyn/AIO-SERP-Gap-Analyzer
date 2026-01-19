import{r as o,j as e,c as p}from"./index.js";const x=()=>{const[n,s]=o.useState(null),[i,l]=o.useState(null);o.useEffect(()=>{chrome.storage.local.get(["aioData","analysisResult"],t=>{t.aioData&&s(t.aioData),t.analysisResult&&l(t.analysisResult)})},[]);const r=()=>{n?.aiOverviewText&&navigator.clipboard.writeText(n.aiOverviewText)},d=()=>{if(i){const t=`
Summary: ${i.summary}

Missing Topics:
${i.missingTopics.map(a=>`- ${a}`).join(`
`)}

Missing Entities:
${i.missingEntities.map(a=>`- ${a}`).join(`
`)}

Recommended Sections:
${i.recommendedSections.map(a=>`${a.title}: ${a.whatToInclude} (${a.whereToPlace})`).join(`
`)}

Suggested Snippets:
${i.suggestedSnippets.map(a=>`- ${a}`).join(`
`)}

Priority Actions:
${i.priorityActions.map(a=>`${a.action} (${a.rationale})`).join(`
`)}

Risks and Caveats:
${i.risksAndCaveats.map(a=>`- ${a}`).join(`
`)}
      `.trim();navigator.clipboard.writeText(t)}},m=()=>{chrome.storage.local.remove(["aioData","analysisResult"]),s(null),l(null)};return e.jsxs("div",{className:"sidepanel",children:[e.jsxs("header",{children:[e.jsx("h1",{children:"AIO Gap Analysis"}),i&&e.jsxs("div",{className:"metadata",children:[e.jsxs("div",{children:["Query: ",i.query]}),e.jsxs("div",{children:["Analyzed: ",new Date(i.timestamp).toLocaleString()]})]})]}),e.jsxs("div",{className:"content",children:[e.jsxs("div",{className:"section",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h2",{children:"AI Overview Text"}),e.jsx("button",{onClick:r,className:"copy-btn",children:"Copy AIO"})]}),e.jsx("textarea",{className:"scrollable-text",value:n?.aiOverviewText||"No AI Overview detected yet",readOnly:!0})]}),e.jsxs("div",{className:"section",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h2",{children:"Gap Analysis Recommendations"}),e.jsx("button",{onClick:d,className:"copy-btn",children:"Copy Recommendations"})]}),e.jsx("textarea",{className:"scrollable-text",value:i?j(i):"No analysis results yet. Run gap analysis from the popup.",readOnly:!0})]})]}),e.jsx("footer",{children:e.jsx("button",{onClick:m,className:"clear-btn",children:"Clear All Data"})})]})};function j(n){return`
SUMMARY:
${n.summary}

MISSING TOPICS:
${n.missingTopics.map(s=>`• ${s}`).join(`
`)}

MISSING ENTITIES:
${n.missingEntities.map(s=>`• ${s}`).join(`
`)}

RECOMMENDED SECTIONS:
${n.recommendedSections.map(s=>`• ${s.title}: ${s.whatToInclude} (Place: ${s.whereToPlace})`).join(`
`)}

SUGGESTED SNIPPETS:
${n.suggestedSnippets.map(s=>`• ${s}`).join(`
`)}

PRIORITY ACTIONS:
${n.priorityActions.map(s=>`• ${s.action} - ${s.rationale}`).join(`
`)}

RISKS AND CAVEATS:
${n.risksAndCaveats.map(s=>`• ${s}`).join(`
`)}
  `.trim()}const c=document.getElementById("sidepanel-root");c&&p.createRoot(c).render(e.jsx(x,{}));
