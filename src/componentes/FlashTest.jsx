import { useState, useEffect } from "react"; 
import styles from "./FlashTest.module.css";
import SettingsModal from "./SettingsModal";

export default function FlashTest() {
  const [stage, setStage] = useState("idle"); // idle | flash | answer | result
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShowing, setIsShowing] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Configurações
  const [settings, setSettings] = useState({
    digits: 1,
    count: 5,
    flashTime: 800,
    intervalTime: 300,
    voice: false,         // 👈 agora tem voice
    language: "pt-BR",    // 👈 idioma da fala
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // 🔢 gera a sequência de números
  const generateSequence = () => {
    const seq = [];
    for (let i = 0; i < settings.count; i++) {
      const min = Math.pow(10, settings.digits - 1);
      const max = Math.pow(10, settings.digits) - 1;
      seq.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return seq;
  };

  // ▶️ iniciar teste
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

  // 🔁 repetir
  const replayTest = () => {
    setStage("flash");
    setCurrentIndex(0);
    setIsShowing(true);
  };

  // 🔊 falar número
  const speakNumber = (num) => {
    if (!settings.voice) return; // 👈 só fala se a voz estiver ativada
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(num.toString());
    utterance.lang = settings.language;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Exibição dos números
  useEffect(() => {
    if (stage !== "flash") return;

    if (currentIndex >= sequence.length) {
      setIsShowing(false);
      setStage("answer");
      return;
    }

    setIsShowing(true);
    speakNumber(sequence[currentIndex]); // 🔊 fala o número

    const showTimer = setTimeout(() => {
      setIsShowing(false);
      const gapTimer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, Math.max(0, settings.intervalTime));

      return () => clearTimeout(gapTimer);
    }, Math.max(0, settings.flashTime));

    return () => clearTimeout(showTimer);
  }, [stage, currentIndex, sequence, settings.flashTime, settings.intervalTime, settings.language, settings.voice]);

  // ✅ verificar resposta
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

      {/* Modal */}
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