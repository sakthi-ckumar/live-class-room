import { useState } from "react";
import JoinSession from "./pages/JoinSession";
import Classroom from "./pages/Classroom";

function App() {
  const [sessionInfo, setSessionInfo] = useState(null);

  if (!sessionInfo) {
    return <JoinSession onJoin={setSessionInfo} />;
  }

  return <Classroom sessionInfo={sessionInfo} onLeave={() => setSessionInfo(null)} />;
}

export default App;
