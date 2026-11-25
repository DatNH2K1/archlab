/**
 * Shows exam phrases with the answer they point to.
 * @param props Trigger phrases and their answers.
 */
export const KeywordCards = (props: { keywords: { trigger: string; answer: string }[] }) => (
  <ul className="grid gap-2 sm:grid-cols-2">
    {props.keywords.map((keyword) => (
      <li key={keyword.trigger} className="flex flex-col gap-1.5 rounded-lg border border-line bg-panel p-3">
        <span className="text-sm text-chalk/80 italic">“{keyword.trigger}”</span>
        <span className="text-sm font-semibold text-accent">→ {keyword.answer}</span>
      </li>
    ))}
  </ul>
);
