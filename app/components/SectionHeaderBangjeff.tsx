export default function SectionHeaderBangjeff({
  step,
  title,
}: {
  step: number | string;
  title: string;
}) {
  return (
    <div className="sectionBangjeff">
      <div className="sectionBangjeffStep">{step}</div>
      <div className="sectionBangjeffTitle">{title}</div>
    </div>
  );
}
