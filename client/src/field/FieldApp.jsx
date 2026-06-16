import { useState } from 'react';
import CrewSetup from './CrewSetup';
import FieldHome from './FieldHome';

export default function FieldApp() {
  const saved = localStorage.getItem('fieldops_crew');
  const [crew, setCrew] = useState(saved ? JSON.parse(saved) : null);

  if (!crew || !crew.crew_name) {
    return <CrewSetup onSave={setCrew} />;
  }

  return <FieldHome crew={crew} onChangeCrew={() => setCrew(null)} />;
}
