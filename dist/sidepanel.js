import{r as o,j as e,c as p}from"./client.js";const j=()=>{const[a,s]=o.useState(null),[i,l]=o.useState(null);o.useEffect(()=>{chrome.storage.local.get(["aioData","analysisResult"],t=>{t.aioData&&s(t.aioData),t.analysisResult&&l(t.analysisResult)})},[]);const r=()=>{a!=null&&a.aiOverviewText&&navigator.clipboard.writeText(a.aiOverviewText)},d=()=>{if(i){const t=`
Summary: ${i.summary}

Missing Topics:
${i.missingTopics.map(n=>`- ${n}`).join(`
`)}

Missing Entities:
${i.missingEntities.map(n=>`- ${n}`).join(`
`)}

Recommended Sections:
${i.recommendedSections.map(n=>`${n.title}: ${n.whatToInclude} (${n.whereToPlace})`).join(`
`)}

Suggested Snippets:
${i.suggestedSnippets.map(n=>`- ${n}`).join(`
`)}

Priority Actions:
${i.priorityActions.map(n=>`${n.action} (${n.rationale})`).join(`
`)}

Risks and Caveats:
${i.risksAndCaveats.map(n=>`- ${n}`).join(`
`)}
      `.trim();navigator.clipboard.writeText(t)}},m=()=>{chrome.storage.local.remove(["aioData","analysisResult"]),s(null),l(null)};return e.jsxs("div",{className:"sidepanel",children:[e.jsxs("header",{children:[e.jsx("h1",{children:"AIO Gap Analysis"}),i&&e.jsxs("div",{className:"metadata",children:[e.jsxs("div",{children:["Query: ",i.query]}),e.jsxs("div",{children:["Analyzed: ",new Date(i.timestamp).toLocaleString()]})]})]}),e.jsxs("div",{className:"content",children:[e.jsxs("div",{className:"section",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h2",{children:"AI Overview Text"}),e.jsx("button",{onClick:r,className:"copy-btn",children:"Copy AIO"})]}),e.jsx("textarea",{className:"scrollable-text",value:(a==null?void 0:a.aiOverviewText)||"No AI Overview detected yet",readOnly:!0})]}),e.jsxs("div",{className:"section",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h2",{children:"Gap Analysis Recommendations"}),e.jsx("button",{onClick:d,className:"copy-btn",children:"Copy Recommendations"})]}),e.jsx("textarea",{className:"scrollable-text",value:i?x(i):"No analysis results yet. Run gap analysis from the popup.",readOnly:!0})]})]}),e.jsx("footer",{children:e.jsx("button",{onClick:m,className:"clear-btn",children:"Clear All Data"})})]})};function x(a){return`
SUMMARY:
${a.summary}

MISSING TOPICS:
${a.missingTopics.map(s=>`• ${s}`).join(`
`)}

MISSING ENTITIES:
${a.missingEntities.map(s=>`• ${s}`).join(`
`)}

RECOMMENDED SECTIONS:
${a.recommendedSections.map(s=>`• ${s.title}: ${s.whatToInclude} (Place: ${s.whereToPlace})`).join(`
`)}

SUGGESTED SNIPPETS:
${a.suggestedSnippets.map(s=>`• ${s}`).join(`
`)}

PRIORITY ACTIONS:
${a.priorityActions.map(s=>`• ${s.action} - ${s.rationale}`).join(`
`)}

RISKS AND CAVEATS:
${a.risksAndCaveats.map(s=>`• ${s}`).join(`
`)}
  `.trim()}const c=document.getElementById("sidepanel-root");c&&p(c).render(e.jsx(j,{}));
