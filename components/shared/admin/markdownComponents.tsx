import type { Components } from "react-markdown"



export const proseMarkdownComponents: Components = {
    p: ({ children }) => (
        <p className="text-gray-600 leading-relaxed mb-3 last:mb-0">{children}</p>
    ),
    strong: ({ children }) => (
        <strong className="font-bold text-gray-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    ul: ({ children }) => (
        <ul className="list-disc list-outside pl-5 space-y-1 mb-3 text-gray-600">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal list-outside pl-5 space-y-1 mb-3 text-gray-600">
            {children}
        </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    a: ({ children, href }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF5A00] underline hover:text-orange-600"
        >
            {children}
        </a>
    ),
    h1: ({ children }) => (
        <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2 first:mt-0">{children}</h3>
    ),
    h2: ({ children }) => (
        <h4 className="text-base font-bold text-gray-900 mt-4 mb-2 first:mt-0">{children}</h4>
    ),
    h3: ({ children }) => (
        <h5 className="text-sm font-bold text-gray-900 mt-3 mb-1 first:mt-0">{children}</h5>
    ),
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-orange-200 pl-4 italic text-gray-500 my-3">
            {children}
        </blockquote>
    ),
    code: ({ children }) => (
        <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
            {children}
        </code>
    ),
    hr: () => <hr className="my-4 border-gray-200" />,
}