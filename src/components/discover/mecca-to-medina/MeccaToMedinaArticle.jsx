import React from 'react';
import MeccaToMedinaNav from './MeccaToMedinaNav.jsx';
import AbstractSection from './AbstractSection.jsx';
import SociopoliticalBackdropSection from './SociopoliticalBackdropSection.jsx';
import WarfareStagesTimeline from './WarfareStagesTimeline.jsx';
import JewishRelationsSection from './JewishRelationsSection.jsx';
import ChristologicalShiftSection from './ChristologicalShiftSection.jsx';
import DoctrineOfNaskhSection from './DoctrineOfNaskhSection.jsx';
import ComparativeSynthesisSection from './ComparativeSynthesisSection.jsx';
import InterpretiveFrameworksSection from './InterpretiveFrameworksSection.jsx';
import ConclusionSection from './ConclusionSection.jsx';

export default function MeccaToMedinaArticle({ data, base = '' }) {
  if (!data) return null;

  const getSection = (id) => data.sections?.find((s) => s.id === id);

  return (
    <div className="mm-article-root">
      {/* Sticky Navigation Bar */}
      <MeccaToMedinaNav />

      {/* Abstract Section */}
      <AbstractSection data={data.abstract} base={base} />

      {/* 1. Sociopolitical Backdrop */}
      <SociopoliticalBackdropSection section={getSection('sociopolitical-backdrop')} base={base} />

      {/* 2. Four Stages of Warfare */}
      <WarfareStagesTimeline section={getSection('four-stages-of-warfare')} base={base} />

      {/* 3. Deterioration of Relations with Jewish Tribes */}
      <JewishRelationsSection section={getSection('relations-with-jewish-tribes')} base={base} />

      {/* 4. Christological Shift */}
      <ChristologicalShiftSection section={getSection('christological-shift')} base={base} />

      {/* 5. Doctrine of Naskh */}
      <DoctrineOfNaskhSection section={getSection('doctrine-of-naskh')} base={base} />

      {/* 6. Comparative Synthesis */}
      <ComparativeSynthesisSection section={getSection('comparative-synthesis')} base={base} />

      {/* 7. Interpretive Frameworks */}
      <InterpretiveFrameworksSection section={getSection('interpretive-frameworks')} base={base} />

      {/* 8. Conclusion */}
      <ConclusionSection section={getSection('conclusion')} base={base} />

      <style>{`
        .mm-article-root {
          width: 100%;
          box-sizing: border-box;
        }

        .animate-fade-in {
          animation: mmFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes mmFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
