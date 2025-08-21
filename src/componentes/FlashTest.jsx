import { useState, useEffect } from "react"; 
import styles from "./FlashTest.module.css";
import SettingsModal from "./SettingsModal";

export default function FlashTest() {
  const [stage, setStage] = useState("idle"); // idle | flash | answer | result
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShowing, setIsShowing] = useState(false); // controla se o número está visível
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Configurações unificadas
  const [settings, setSettings] = useState({
    digits: 1,
    count: 5,
    flashTime: 800,     // ms
    intervalTime: 300,  // ms
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const generateSequence = () => {
    const seq = [];
    for (let i = 0; i < settings.count; i++) {
      const min = Math.pow(10, settings.digits - 1);
      const max = Math.pow(10, settings.digits) - 1;
      seq.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return seq;
  };

  const startTest = () => {
    const seq = generateSequence();
    setSequence(seq);
    setCorrectAnswer(seq.reduce((a, b) => a + b, 0));
    setStage("flash");
    setCurrentIndex(0);
    setIsShowing(true);
    setUserAnswer("");
    setScore(null);
  };

  const replayTest = () => {
    setStage("flash");
    setCurrentIndex(0);
    setIsShowing(true);
  };

  // Lógica de exibição com 2 fases: mostrar (flashTime) e intervalo (intervalTime)
  useEffect(() => {
    if (stage !== "flash") return;

    // terminou a sequência -> vai para answer (mostra "?")
    if (currentIndex >= sequence.length) {
      setIsShowing(false);
      setStage("answer");
      return;
    }

    // Fase 1: garante que o número atual esteja visível por flashTime
    setIsShowing(true);
    const showTimer = setTimeout(() => {
      // Fase 2: esconde durante o intervalo, depois avança índice
      setIsShowing(false);
      const gapTimer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, Math.max(0, settings.intervalTime));

      // cleanup do gapTimer
      return () => clearTimeout(gapTimer);
    }, Math.max(0, settings.flashTime));

    return () => clearTimeout(showTimer);
  }, [stage, currentIndex, sequence.length, settings.flashTime, settings.intervalTime]);

  const checkAnswer = () => {
    setScore(Number(userAnswer) === correctAnswer);
    setStage("result");
  };

  return (
    <div className={styles.container}>
      {/* Área do número */}
      <div className={styles.flashArea}>
        {stage === "flash" && currentIndex < sequence.length && (
          isShowing ? sequence[currentIndex] : ""
        )}

        {stage === "answer" && "?"}

        {stage === "result" && (
          <div>
            {score ? "✅ Acertou!" : "❌ Errou"}<br />
            <small>Resposta correta: {correctAnswer}</small>
          </div>
        )}
      </div>

      {/* Barra inferior */}
      <div className={styles.bottomBar}>
        <button className={`${styles.button} ${styles.play}`} onClick={startTest}>
          Play
        </button>
        <button className={`${styles.button} ${styles.replay}`} onClick={replayTest}>
          Replay
        </button>
        <button className={`${styles.button} ${styles.settings}`} onClick={() => setShowSettings(true)}>
          Settings
        </button>
        <button className={`${styles.button} ${styles.history}`}>
          History
        </button>

        <input
          type="number"
          placeholder="Your answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className={styles.inputAnswer}
          disabled={stage !== "answer"}
        />
        <button
          className={`${styles.button} ${styles.check}`}
          onClick={checkAnswer}
          disabled={stage !== "answer"}
        >
          Check
        </button>
      </div>

      {/* Modal de Configurações */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          handleChange={handleChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}