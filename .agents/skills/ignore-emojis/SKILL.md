---
name: ignore-emojis
description: >-
  Strictly mandates omitting all emojis from AI responses, code, UI text, buttons, tags,
  notifications, logs, and documentation. Use this skill when generating text, writing code,
  or designing UI components to ensure a clean, professional, emoji-free aesthetic.
---

# Ignore Emojis Skill Guidelines

This skill enforces a strict **NO EMOJI** policy across all AI assistant responses, user interface components, buttons, tags, notifications, error messages, log statements, and documentation in the project.

---

## Directives

1. **No Emojis in AI Responses**:
   - Do NOT include any emojis (e.g. 🎉, 🛠️, 🧪, 🌐, 🏬, 🟡, 🔵, 🚚, ✅, ❌, 📊, 🧾, 📦, 👥, 📈, 🗺️, 📞, ⚡, 🔔, 🔴, 📋, ✨, 🚀) in explanations, summaries, status updates, markdown text, or chat messages.
   - Use clean, professional formatting with standard markdown headers, bold text, bullet points, and code blocks.

2. **No Emojis in Code & UI Components**:
   - Do NOT place emojis inside JSX/TSX elements, button text, tag titles, navigation menus, modal headers, notification popovers, toasts, or tooltips.
   - Use clean text labels or official icon components (e.g., Ant Design / Lucide icons) instead of emojis.

3. **No Emojis in Backend & API Logs**:
   - Do NOT use emojis in server logs, API error responses, validation messages, or database scripts.

---

## Examples

### AI Responses
- **Incorrect**: "បានរៀបចំប្រព័ន្ធគ្រប់គ្រង 🎉 ដំណើរការបាន ១០០% រួចរាល់ហើយ! 🚀"
- **Correct**: "បានរៀបចំប្រព័ន្ធគ្រប់គ្រង ដំណើរការបាន ១០០% រួចរាល់ហើយ។"

### UI Components (Ant Design / React)
- **Incorrect**: `<Tag color="green">🌐 Online Store</Tag>`
- **Correct**: `<Tag color="green">Online Store</Tag>`

- **Incorrect**: `<Statistic title="🌐 Online Store Orders" value={metrics.onlineRevenue} />`
- **Correct**: `<Statistic title="Online Store Orders" value={metrics.onlineRevenue} />`

- **Incorrect**: `description: "No online orders received yet 📦"`
- **Correct**: `description: "No online orders received yet"`
