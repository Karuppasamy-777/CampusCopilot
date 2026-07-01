"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
}

// Helper to render inline elements like bold (**text**) and code (`code`)
function renderInline(text: string): React.ReactNode[] {
  // Split by bold pattern **...** and inline code `...`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`strong-${index}`} className="font-extrabold text-zinc-900 dark:text-zinc-50">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`code-inline-${index}`} className="px-1 py-0.5 rounded bg-zinc-105 dark:bg-zinc-800 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold border border-zinc-200/50 dark:border-zinc-700/50">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // 1. Separate code blocks from normal text
  const parts = content.split(/(\`\`\`[a-z]*\n[\s\S]*?\`\`\`)/g);

  return (
    <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // It's a code block
          const lines = part.split("\n");
          const firstLine = lines[0];
          const language = firstLine.slice(3).trim() || "code";
          const code = lines.slice(1, -1).join("\n");
          
          return (
            <div key={`code-block-${index}`} className="rounded-xl border border-zinc-200/80 dark:border-zinc-855 bg-zinc-950 text-zinc-100 font-mono text-[10px] overflow-hidden my-2 shadow-sm">
              <div className="flex items-center justify-between px-3 py-1 border-b border-zinc-800 bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider text-[8px]">
                <span>{language}</span>
              </div>
              <pre className="p-3 overflow-x-auto whitespace-pre leading-normal">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // It's normal text block, let's process lines
        const lines = part.split("\n");
        const renderedBlocks: React.ReactNode[] = [];
        let i = 0;

        while (i < lines.length) {
          const line = lines[i];

          // Empty line
          if (!line.trim()) {
            i++;
            continue;
          }

          // Headings
          if (line.startsWith("### ")) {
            renderedBlocks.push(
              <h5 key={`heading-h5-${i}`} className="text-xs font-bold text-zinc-900 dark:text-zinc-50 font-outfit uppercase tracking-wider mt-3 mb-1">
                {renderInline(line.slice(4))}
              </h5>
            );
            i++;
            continue;
          }
          if (line.startsWith("## ")) {
            renderedBlocks.push(
              <h4 key={`heading-h4-${i}`} className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-outfit mt-4 mb-1.5 border-b border-zinc-150 pb-0.5">
                {renderInline(line.slice(3))}
              </h4>
            );
            i++;
            continue;
          }
          if (line.startsWith("# ")) {
            renderedBlocks.push(
              <h3 key={`heading-h3-${i}`} className="text-md font-black text-zinc-900 dark:text-zinc-50 font-outfit mt-4 mb-2">
                {renderInline(line.slice(2))}
              </h3>
            );
            i++;
            continue;
          }

          // Table parsing
          if (line.startsWith("|") && i + 1 < lines.length && lines[i + 1].includes("|-")) {
            // Start of a table
            const headers = line.split("|").map(h => h.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            const tableRows: string[][] = [];
            
            // Skip the separator line (i + 1)
            i += 2;
            
            while (i < lines.length && lines[i].startsWith("|")) {
              const rowCells = lines[i].split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
              tableRows.push(rowCells);
              i++;
            }
            
            renderedBlocks.push(
              <div key={`table-${i}`} className="overflow-x-auto my-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/20 shadow-xxs">
                <table className="w-full border-collapse text-[10px] text-left text-zinc-655 dark:text-zinc-350">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200/60 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-extrabold uppercase tracking-wider text-[8px]">
                    <tr>
                      {headers.map((header, hIdx) => (
                        <th key={`table-header-${hIdx}`} className="px-2.5 py-1.5">{renderInline(header)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                    {tableRows.map((row, rIdx) => (
                      <tr key={`table-row-${rIdx}`} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-955/40">
                        {row.map((cell, cIdx) => (
                          <td key={`table-cell-${cIdx}`} className="px-2.5 py-1.5 font-medium">{renderInline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            continue;
          }

          // Unordered list
          if (line.startsWith("* ") || line.startsWith("- ")) {
            const listItems: string[] = [];
            while (i < lines.length && (lines[i].startsWith("* ") || lines[i].startsWith("- "))) {
              listItems.push(lines[i].slice(2));
              i++;
            }
            renderedBlocks.push(
              <ul key={`list-unordered-${i}`} className="list-disc pl-4.5 space-y-0.5 my-1.5 text-zinc-655 dark:text-zinc-350 font-medium">
                {listItems.map((item, lIdx) => (
                  <li key={`list-item-${lIdx}`}>{renderInline(item)}</li>
                ))}
              </ul>
            );
            continue;
          }

          // Ordered list
          if (/^\d+\.\s/.test(line)) {
            const listItems: string[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
              // Extract the item text after the dot and space
              const match = lines[i].match(/^\d+\.\s(.*)/);
              if (match) {
                listItems.push(match[1]);
              } else {
                listItems.push(lines[i].replace(/^\d+\.\s/, ""));
              }
              i++;
            }
            renderedBlocks.push(
              <ol key={`list-ordered-${i}`} className="list-decimal pl-4.5 space-y-0.5 my-1.5 text-zinc-655 dark:text-zinc-350 font-medium">
                {listItems.map((item, lIdx) => (
                  <li key={`list-item-ordered-${lIdx}`}>{renderInline(item)}</li>
                ))}
              </ol>
            );
            continue;
          }

          // Plain paragraph
          renderedBlocks.push(
            <p key={`paragraph-${i}`} className="my-1 text-zinc-755 dark:text-zinc-250 leading-relaxed font-semibold">
              {renderInline(line)}
            </p>
          );
          i++;
        }

        return <React.Fragment key={`text-block-${index}`}>{renderedBlocks}</React.Fragment>;
      })}
    </div>
  );
}

export default MarkdownRenderer;
