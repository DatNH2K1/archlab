/**
 * Shows earned stars out of three.
 * @param props The number of stars earned.
 */
export const Stars = (props: { count: number }) => (
  <span className="tracking-widest text-accent" aria-label={`${props.count}/3`}>
    {'★'.repeat(props.count)}
    <span className="text-line">{'★'.repeat(3 - props.count)}</span>
  </span>
);
