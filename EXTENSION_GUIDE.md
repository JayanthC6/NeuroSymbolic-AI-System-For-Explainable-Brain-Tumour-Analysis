# 📊 Diagram Extension Setup Guide

## Recommended Extensions for VS Code

### Option 1: Mermaid Chart (Recommended)
**The official Mermaid editor with AI-powered features**

1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search for "Mermaid Chart"
3. Install the extension by **MermaidChart**
4. Features:
   - Visual diagram editor
   - AI-powered diagram generation
   - Live preview
   - Export to PNG/SVG

### Option 2: Mermaid Markdown Syntax Highlighting
**Lightweight syntax highlighting**

1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search for "Mermaid Markdown Syntax Highlighting"
3. Install the extension by **bpruitt-goddard**
4. Features:
   - Syntax highlighting for Mermaid code blocks
   - Works with markdown preview

### Best Setup: Install Both!
For the best experience, install both extensions:
- **Mermaid Chart** for visual editing and preview
- **Mermaid Markdown Syntax Highlighting** for syntax highlighting

## How to View Diagrams

### Method 1: Markdown Preview (Built-in)
1. Open any `.md` file with Mermaid diagrams
2. Press `Ctrl+Shift+V` to open preview
3. Diagrams will render automatically

### Method 2: Mermaid Chart Preview
1. Right-click on a Mermaid code block
2. Select "Open in Mermaid Chart"
3. Edit and export as needed

## Quick Start Example

Create a new file `test-diagram.md` and paste this:

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Check installation]
    D --> A
\`\`\`

Press `Ctrl+Shift+V` to preview. You should see a flowchart!

## Diagram Types Supported

Mermaid supports all the diagram types you need:

- **Flowcharts** - System architecture, workflows
- **Sequence Diagrams** - API calls, user interactions
- **Class Diagrams** - Database models, OOP structure
- **State Diagrams** - Activity flows
- **ER Diagrams** - Database relationships
- **User Journey** - Use case flows
- **Gantt Charts** - Project timelines

## Troubleshooting

### Diagrams not rendering?
1. Ensure you have the Mermaid extension installed
2. Check that code blocks use \`\`\`mermaid (not \`\`\`markdown)
3. Restart VS Code

### Syntax errors?
- Use the [Mermaid Live Editor](https://mermaid.live) to test syntax
- Check the [official documentation](https://mermaid.js.org/)

## Next Steps

✅ Install the extensions above  
✅ Open `ARCHITECTURE_DOCUMENTATION.md` to see all project diagrams  
✅ Use `Ctrl+Shift+V` to preview diagrams  
✅ Edit diagrams directly in the markdown files
