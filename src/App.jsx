import { useCallback, useEffect, useRef, useState } from 'react';
import { SCREENS } from './routes.js';
import SessionList from './components/SessionList.jsx';
import WalkFlow from './components/WalkFlow.jsx';
import Summary from './components/Summary.jsx';
import UpdateBanner from './components/UpdateBanner.jsx';

export default function App() {
  const [screen, setScreen] = useState({ name: SCREENS.HOME });
  const backLock = useRef(null); // set while recording: Android back must not end a walk

  const go = useCallback((name, id) => {
    if (name !== SCREENS.HOME) window.history.pushState({ ntr: name }, '');
    setScreen({ name, id });
  }, []);

  useEffect(() => {
    const onPop = () => {
      if (backLock.current) { window.history.pushState({ ntr: 'lock' }, ''); backLock.current(); return; }
      setScreen({ name: SCREENS.HOME });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <>
      {screen.name === SCREENS.HOME && <SessionList onNew={() => go(SCREENS.WALK)} onOpen={(id) => go(SCREENS.SUMMARY, id)} />}
      {screen.name === SCREENS.WALK && (
        <WalkFlow
          setBackLock={(fn) => { backLock.current = fn; }}
          onCancel={() => setScreen({ name: SCREENS.HOME })}
          onDone={(id) => setScreen({ name: SCREENS.SUMMARY, id })}
        />
      )}
      {screen.name === SCREENS.SUMMARY && <Summary id={screen.id} onBack={() => setScreen({ name: SCREENS.HOME })} />}
      {screen.name === SCREENS.HOME && <UpdateBanner />}
    </>
  );
}
