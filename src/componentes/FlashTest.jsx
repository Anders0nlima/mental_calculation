import { useState, useEffect, useRef } from "react";
import styles from "./FlashTest.module.css";
import SettingsModal from "./SettingsModal";
import HistoryModal from "./HistoryModal";

export default function FlashTest() {
  const [stage, setStage] = useState("idle"); // idle | flash | answer | result
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShowing, setIsShowing] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(null);

  // modais
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // histórico
  const [history, setHistory] = useState([]);

  // controla ciclo contínuo
  const [isRunning, setIsRunning] = useState(false);

  // controla disponibilidade do Replay
  const [canReplay, setCanReplay] = useState(false);

  // timers refs
  const showTimerRef = useRef(null);
  const resultTimerRef = useRef(null);
  const answerTimerRef = useRef(null);

  // input ref
  const inputRef = useRef(null);

  // ⚙️ Configurações
  const [settings, setSettings] = useState({
    digits: 1,
    count: 5,
    flashTime: 500,
    intervalTime: 1000,
    voice: false,
    language: "pt-BR",
    subtractions: false,
    continuous: false,
    fontSize: 100,
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const clearAllTimers = () => {
    [showTimerRef, resultTimerRef, answerTimerRef].forEach((ref) => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
  };

  // 🔢 Gera sequência
  const generateSequence = () => {
    const seq = [];
    let runningTotal = 0;

    for (let i = 0; i < settings.count; i++) {
      const min = Math.pow(10, Math.max(0, settings.digits - 1));
      const max = Math.pow(10, settings.digits) - 1;
      const n = Math.floor(Math.random() * (max - min + 1)) + min;

      let val = n;
      if (settings.subtractions && Math.random() > 0.5) {
        if (runningTotal - n >= 0) {
          val = -n;
        }
      }

      seq.push(val);
      runningTotal += val;
    }

    return seq;
  };

  const saveToHistory = (seq) => {
    const expression = seq
      .map((n, idx) =>
        idx === 0 ? n : n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`
      )
      .join(" ");
    setHistory((prev) => {
      const updated = [expression, ...prev];
      return updated.slice(0, 20);
    });
  };

  const startSequence = () => {
    clearAllTimers();
    const seq = generateSequence();
    setSequence(seq);
    setCorrectAnswer(seq.reduce((a, b) => a + b, 0));
    setStage("flash");
    setCurrentIndex(0);
    setIsShowing(true);
    setUserAnswer("");
    setScore(null);
    setCanReplay(false);
  };

  const startTest = () => {
    setIsRunning(true);
    startSequence();
  };

  const stopTest = () => {
    setIsRunning(false);
    clearAllTimers();
    setStage("idle");
    setSequence([]);
    setCurrentIndex(0);
    setIsShowing(false);
    setUserAnswer("");
    setCanReplay(false);
  };

  const replayTest = () => {
    if (!canReplay || sequence.length === 0) return;
    clearAllTimers();
    setStage("flash");
    setCurrentIndex(0);
    setIsShowing(true);
    setUserAnswer("");
    setScore(null);
  };

  // 🔊 fala número (Promise)
  const speakNumber = (num, isResult = false) => {
    return new Promise((resolve) => {
      if (!settings.voice || !window.speechSynthesis) {
        resolve();
        return;
      }

      try {
        let text;
        if (isResult) {
          text = settings.language.startsWith("pt")
            ? `igual a ${num}`
            : `equals ${num}`;
        } else {
          text = num.toString();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = settings.language;

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
  };

  // execução do flash controlada por voz
  useEffect(() => {
    if (stage !== "flash" || sequence.length === 0) return;

    let cancelled = false;

    const run = async () => {
      for (let i = currentIndex; i < sequence.length; i++) {
        if (cancelled) return;

        setCurrentIndex(i);
        setIsShowing(true);

        await speakNumber(sequence[i]); // espera a fala
        if (cancelled) return;

        await new Promise((res) =>
          setTimeout(res, Math.max(0, settings.flashTime))
        );

        setIsShowing(false);
        await new Promise((res) =>
          setTimeout(res, Math.max(0, settings.intervalTime))
        );
      }

      if (!cancelled) {
        setStage("answer");
        setCanReplay(true);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [stage, sequence, settings.flashTime, settings.intervalTime]);

  // 👁️ mostra "?" no contínuo
  useEffect(() => {
    if (stage !== "answer" || !settings.continuous || !isRunning) return;

    answerTimerRef.current = setTimeout(async () => {
      await speakNumber(correctAnswer, true);
      setStage("result");
    }, 2000);

    return () => {
      if (answerTimerRef.current) {
        clearTimeout(answerTimerRef.current);
        answerTimerRef.current = null;
      }
    };
  }, [stage, settings.continuous, isRunning, correctAnswer]);

  const checkAnswer = () => {
    setScore(Number(userAnswer) === correctAnswer);
    setStage("result");
    if (!settings.continuous) {
      saveToHistory(sequence);
    }
  };

  useEffect(() => {
    if (stage !== "result") {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
      return;
    }

    if (settings.continuous && isRunning) {
      resultTimerRef.current = setTimeout(() => {
        startSequence();
      }, 2000);
      return () => clearTimeout(resultTimerRef.current);
    } else {
      setIsRunning(false);
    }
  }, [stage, settings.continuous, isRunning]);

  useEffect(() => {
    if (!settings.continuous && isRunning && stage === "idle") {
      stopTest();
    }
  }, [settings.continuous]);

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const Big = ({ children }) => (
    <span style={{ fontSize: settings.fontSize || 72, lineHeight: 1 }}>
      {children}
    </span>
  );

  useEffect(() => {
    if (stage === "answer" && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      inputRef.current.select?.();
    }
  }, [stage]);

  // atalhos
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === "enter" && stage === "answer") {
        e.preventDefault();
        checkAnswer();
        return;
      }

      const tag = e.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      switch (key) {
        case "p":
          if (isRunning) stopTest();
          else startTest();
          break;
        case "r":
          if (canReplay) replayTest();
          break;
        case "s":
          setShowSettings(true);
          break;
        case "h":
          setShowHistory(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, sequence.length, stage, canReplay]);

  return (
    <div className={styles.container}>
      <div className={styles.flashArea}>
        {stage === "flash" && currentIndex < sequence.length && (
          isShowing ? <Big>{String(sequence[currentIndex])}</Big> : ""
        )}
        {stage === "answer" && <Big>?</Big>}
        {stage === "result" && (
          settings.continuous && isRunning ? (
            <Big>= {correctAnswer}</Big>
          ) : (
            <div>
              {score ? "✅ Acertou!" : "❌ Errou"}<br />
              <small>Resposta correta: {correctAnswer}</small>
            </div>
          )
        )}
      </div>

      <div className={styles.bottomBar}>
        {isRunning ? (
          <button className={`${styles.button} ${styles.stop}`} onClick={stopTest}>
            Stop
          </button>
        ) : (
          <button className={`${styles.button} ${styles.play}`} onClick={startTest}>
            Play
          </button>
        )}

        {!settings.continuous && (
          <button
            className={`${styles.button} ${canReplay ? styles.replayEnabled : styles.replayDisabled}`}
            onClick={replayTest}
            disabled={!canReplay}
          >
            Replay
          </button>
        )}

        <button
          className={`${styles.button} ${styles.settings}`}
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>
        <button
          className={`${styles.button} ${styles.history}`}
          onClick={() => setShowHistory(true)}
        >
          History
        </button>

        {!settings.continuous && (
          <>
            <input
              ref={inputRef}
              type="number"
              placeholder="Your answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={styles.inputAnswer}
              disabled={stage !== "answer"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && stage === "answer") {
                  e.preventDefault();
                  checkAnswer();
                }
              }}
            />
            <button
              className={`${styles.button} ${styles.check}`}
              onClick={checkAnswer}
              disabled={stage !== "answer"}
            >
              Check
            </button>
          </>
        )}
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          handleChange={handleChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHistory && (
        <HistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          history={history}
        />
      )}
    </div>
  );
}